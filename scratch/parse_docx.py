import zipfile
import xml.etree.ElementTree as ET
import os

def extract_docx_text(docx_path, output_path):
    if not os.path.exists(docx_path):
        print(f"File not found: {docx_path}")
        return
        
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            p_tag = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'
            t_tag = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'
            
            paragraphs = []
            for p in root.iter(p_tag):
                texts = []
                for t in p.iter(t_tag):
                    if t.text:
                        texts.append(t.text)
                if texts:
                    paragraphs.append("".join(texts))
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write("\n\n".join(paragraphs))
            print(f"Successfully extracted {len(paragraphs)} paragraphs to {output_path}")
            
    except Exception as e:
        print(f"Error parsing docx file: {e}")

if __name__ == '__main__':
    extract_docx_text('/root/interviewapp/SBTS_BPO_Unified_Assessment_-_final.docx', '/root/interviewapp/scratch/extracted_text.txt')
