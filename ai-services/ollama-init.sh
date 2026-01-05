#!/bin/bash

# Start Ollama service
ollama serve &

# Wait for Ollama to be ready
sleep 5

# Pull Mistral 7B model (this will download if not present)
echo "Pulling Mistral 7B model..."
ollama pull mistral:7b

# Keep container running
wait

