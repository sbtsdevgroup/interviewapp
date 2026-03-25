'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  CircleDot,
  Clock3,
  Gauge,
  GraduationCap,
  RefreshCcw,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const metrics = [
  {
    title: "Total Students",
    value: "108",
    chipClass: "bg-blue-100 text-blue-700",
    iconClass: "text-blue-600",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#D9D9D9" />
        <path
          d="M23.6484 9.55537L16.1484 7.05537C16.0521 7.02321 15.9479 7.02321 15.8516 7.05537L8.35156 9.55537C8.25829 9.58651 8.17718 9.64619 8.11969 9.72597C8.06221 9.80574 8.03127 9.90158 8.03125 9.9999V16.2499C8.03125 16.3742 8.08064 16.4935 8.16854 16.5814C8.25645 16.6693 8.37568 16.7187 8.5 16.7187C8.62432 16.7187 8.74355 16.6693 8.83146 16.5814C8.91936 16.4935 8.96875 16.3742 8.96875 16.2499V10.6499L11.9906 11.6577C11.6096 12.2209 11.3513 12.858 11.2327 13.5275C11.1142 14.1971 11.1379 14.8841 11.3024 15.5439C11.4669 16.2037 11.7684 16.8215 12.1874 17.357C12.6065 17.8926 13.1335 18.3339 13.7344 18.6522C12.2305 19.1624 10.9219 20.1827 9.98438 21.621C9.93049 21.7242 9.91694 21.8438 9.94637 21.9564C9.97581 22.0691 10.0461 22.1668 10.1436 22.2304C10.2411 22.2941 10.3588 22.3192 10.4738 22.3008C10.5888 22.2825 10.6928 22.222 10.7656 22.1312C11.9742 20.2804 13.8812 19.2187 16 19.2187C18.1187 19.2187 20.0258 20.2804 21.2344 22.1312C21.3068 22.2239 21.4114 22.2861 21.5275 22.3053C21.6436 22.3245 21.7627 22.2993 21.8611 22.2347C21.9594 22.1702 22.03 22.071 22.0586 21.9569C22.0872 21.8427 22.0719 21.722 22.0156 21.6187C21.0781 20.1827 19.7711 19.1624 18.2656 18.6499C18.8661 18.3312 19.3929 17.8896 19.8115 17.3539C20.2301 16.8182 20.5313 16.2004 20.6954 15.5406C20.8595 14.8809 20.8829 14.194 20.764 13.5246C20.6451 12.8552 20.3867 12.2183 20.0055 11.6554L23.6484 10.4444C23.7417 10.4132 23.8227 10.3535 23.8801 10.2738C23.9376 10.194 23.9685 10.0982 23.9685 9.9999C23.9685 9.90161 23.9376 9.8058 23.8801 9.72603C23.8227 9.64626 23.7417 9.58656 23.6484 9.55537ZM19.9062 14.3749C19.9065 14.9973 19.758 15.6108 19.4732 16.1643C19.1883 16.7177 18.7754 17.1951 18.2686 17.5566C17.7619 17.9181 17.1762 18.1533 16.5602 18.2425C15.9441 18.3318 15.3157 18.2725 14.7272 18.0697C14.1388 17.8669 13.6073 17.5264 13.177 17.0766C12.7468 16.6267 12.4303 16.0806 12.2539 15.4837C12.0775 14.8868 12.0463 14.2563 12.1629 13.6449C12.2795 13.0335 12.5405 12.4588 12.9242 11.9687L15.8516 12.9444C15.9479 12.9766 16.0521 12.9766 16.1484 12.9444L19.0758 11.9687C19.6147 12.6549 19.9072 13.5024 19.9062 14.3749ZM16 12.0062L9.98438 9.9999L16 7.99365L22.0156 9.9999L16 12.0062Z"
          fill="black"
        />
      </svg>
    ),
    svg: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_2693_8260)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10.0056 0.416504C4.70935 0.416504 0.416016 4.70984 0.416016 10.0061C0.416016 14.6873 3.77018 18.5844 8.20643 19.4269C8.72602 19.5257 9.17185 19.1153 9.17185 18.6169V16.7828C9.17185 16.3786 8.88643 16.0515 8.51977 15.9603C5.84893 15.2961 3.86977 12.8815 3.86977 10.0061C3.86977 6.61734 6.61685 3.87067 10.0056 3.87067C12.9156 3.87067 15.3531 5.89692 15.9827 8.6165C16.0689 8.98859 16.3985 9.28192 16.8085 9.28192H18.6364C19.131 9.28192 19.5393 8.84275 19.4481 8.32609C18.6539 3.83109 14.7289 0.416504 10.0056 0.416504ZM14.1389 15.4273C13.8564 15.1444 13.4281 15.1123 13.1056 15.3019C12.6017 15.5978 12.0578 15.8195 11.4906 15.9603C11.1239 16.0515 10.8389 16.3786 10.8389 16.7828V18.6169C10.8389 19.1153 11.2848 19.5253 11.8043 19.4269C13.0621 19.1879 14.259 18.6982 15.3235 17.9869C15.766 17.6915 15.7939 17.0819 15.4393 16.7273L14.1389 15.4273ZM15.9377 11.5778C16.0364 11.2219 16.3589 10.9486 16.7543 10.9486H18.5952C19.0973 10.9486 19.5093 11.4011 19.4031 11.9236C19.1453 13.1949 18.6305 14.4001 17.8902 15.4653C17.5902 15.8978 16.9889 15.9203 16.6385 15.5698L15.3448 14.2761C15.0585 13.9898 15.0293 13.5565 15.2248 13.2332L15.2348 13.2153C15.2869 13.1223 15.3383 13.029 15.3889 12.9353C15.4831 12.7611 15.5848 12.5653 15.6398 12.4382C15.6952 12.3107 15.7689 12.0994 15.8319 11.9082C15.8661 11.8049 15.8994 11.7012 15.9318 11.5973L15.9377 11.5778Z"
            fill="#0D62D1"
          />
        </g>
        <defs>
          <clipPath id="clip0_2693_8260">
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    title: "Average Score",
    value: "85.2%",
    chipClass: "bg-amber-100 text-amber-700",
    iconClass: "text-amber-600",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#D9D9D9" />
        <path
          d="M18.5002 6.6665C20.1252 6.6665 21.5038 7.23262 22.636 8.36484C23.7682 9.49706 24.3341 10.8754 24.3335 12.4998H22.6668C22.6668 11.9443 22.566 11.4271 22.3643 10.9482C22.1627 10.4693 21.8885 10.0421 21.5418 9.6665L20.396 11.604C20.2571 11.8262 20.1079 12.0693 19.9485 12.3332C19.7891 12.5971 19.6188 12.8262 19.4377 13.0207C19.2432 13.229 19.0002 13.3332 18.7085 13.3332C18.4168 13.3332 18.1668 13.2359 17.9585 13.0415C17.7502 12.8471 17.646 12.604 17.646 12.3123C17.646 12.0207 17.7502 11.7707 17.9585 11.5623C18.1529 11.3679 18.3857 11.1943 18.6568 11.0415C18.9279 10.8887 19.1743 10.7429 19.396 10.604L21.3335 9.45817C20.9585 9.11095 20.5316 8.83678 20.0527 8.63567C19.5738 8.43456 19.0563 8.33373 18.5002 8.33317V6.6665ZM16.0627 23.3332C14.896 23.3332 13.8024 23.1109 12.7818 22.6665C11.7613 22.2221 10.8724 21.6215 10.1152 20.8648C9.35794 20.1082 8.75711 19.2193 8.31266 18.1982C7.86822 17.1771 7.646 16.0832 7.646 14.9165C7.646 12.8887 8.29183 11.1007 9.5835 9.55234C10.8752 8.004 12.521 7.04206 14.521 6.6665C14.271 8.0415 14.3474 9.38539 14.7502 10.6982C15.1529 12.0109 15.8474 13.1601 16.8335 14.1457C17.8196 15.1312 18.9691 15.8257 20.2818 16.229C21.5946 16.6323 22.9382 16.7087 24.3127 16.4582C23.9516 18.4582 22.9932 20.104 21.4377 21.3957C19.8821 22.6873 18.0904 23.3332 16.0627 23.3332ZM16.0627 21.6665C17.2849 21.6665 18.4168 21.3609 19.4585 20.7498C20.5002 20.1387 21.3196 19.2984 21.9168 18.229C20.7224 18.1179 19.5904 17.8157 18.521 17.3223C17.4516 16.829 16.4932 16.159 15.646 15.3123C14.7988 14.4657 14.1252 13.5073 13.6252 12.4373C13.1252 11.3673 12.8266 10.2354 12.7293 9.0415C11.6599 9.63873 10.8232 10.4618 10.2193 11.5107C9.61544 12.5596 9.31322 13.6948 9.31266 14.9165C9.31266 16.7915 9.96905 18.3854 11.2818 19.6982C12.5946 21.0109 14.1882 21.6671 16.0627 21.6665Z"
          fill="black"
        />
      </svg>
    ),
    svg: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_2693_8264)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10.0056 0.416504C4.70935 0.416504 0.416016 4.70984 0.416016 10.0061C0.416016 14.6873 3.77018 18.5844 8.20643 19.4269C8.72602 19.5257 9.17185 19.1153 9.17185 18.6169V16.7828C9.17185 16.3786 8.88643 16.0515 8.51977 15.9603C5.84893 15.2961 3.86977 12.8815 3.86977 10.0061C3.86977 6.61734 6.61685 3.87067 10.0056 3.87067C12.9156 3.87067 15.3531 5.89692 15.9827 8.6165C16.0689 8.98859 16.3985 9.28192 16.8085 9.28192H18.6364C19.131 9.28192 19.5393 8.84275 19.4481 8.32609C18.6539 3.83109 14.7289 0.416504 10.0056 0.416504ZM14.1389 15.4273C13.8564 15.1444 13.4281 15.1123 13.1056 15.3019C12.6017 15.5978 12.0578 15.8195 11.4906 15.9603C11.1239 16.0515 10.8389 16.3786 10.8389 16.7828V18.6169C10.8389 19.1153 11.2848 19.5253 11.8043 19.4269C13.0621 19.1879 14.259 18.6982 15.3235 17.9869C15.766 17.6915 15.7939 17.0819 15.4393 16.7273L14.1389 15.4273ZM15.9377 11.5778C16.0364 11.2219 16.3589 10.9486 16.7543 10.9486H18.5952C19.0973 10.9486 19.5093 11.4011 19.4031 11.9236C19.1453 13.1949 18.6305 14.4001 17.8902 15.4653C17.5902 15.8978 16.9889 15.9203 16.6385 15.5698L15.3448 14.2761C15.0585 13.9898 15.0293 13.5565 15.2248 13.2332L15.2348 13.2153C15.2869 13.1223 15.3383 13.029 15.3889 12.9353C15.4831 12.7611 15.5848 12.5653 15.6398 12.4382C15.6952 12.3107 15.7689 12.0994 15.8319 11.9082C15.8661 11.8049 15.8994 11.7012 15.9318 11.5973L15.9377 11.5778Z"
            fill="#E58411"
          />
        </g>
        <defs>
          <clipPath id="clip0_2693_8264">
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    title: "Completion Rate",
    value: "89.4%",
    chipClass: "bg-green-100 text-green-700",
    iconClass: "text-green-600",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#D9D9D9" />
        <g clip-path="url(#clip0_2693_8254)">
          <path
            d="M7.875 15C7.875 12.8451 8.73103 10.7785 10.2548 9.25476C11.7785 7.73103 13.8451 6.875 16 6.875C18.1549 6.875 20.2215 7.73103 21.7452 9.25476C23.269 10.7785 24.125 12.8451 24.125 15C24.125 15.2486 24.2238 15.4871 24.3996 15.6629C24.5754 15.8387 24.8139 15.9375 25.0625 15.9375C25.3111 15.9375 25.5496 15.8387 25.7254 15.6629C25.9012 15.4871 26 15.2486 26 15C26 13.0222 25.4135 11.0888 24.3147 9.4443C23.2159 7.79981 21.6541 6.51809 19.8268 5.76121C17.9996 5.00433 15.9889 4.8063 14.0491 5.19215C12.1093 5.578 10.3275 6.53041 8.92894 7.92894C7.53041 9.32746 6.578 11.1093 6.19215 13.0491C5.8063 14.9889 6.00433 16.9996 6.76121 18.8268C7.51809 20.6541 8.79981 22.2159 10.4443 23.3147C12.0888 24.4135 14.0222 25 16 25C16.2486 25 16.4871 24.9012 16.6629 24.7254C16.8387 24.5496 16.9375 24.3111 16.9375 24.0625C16.9375 23.8139 16.8387 23.5754 16.6629 23.3996C16.4871 23.2238 16.2486 23.125 16 23.125C13.8451 23.125 11.7785 22.269 10.2548 20.7452C8.73103 19.2215 7.875 17.1549 7.875 15Z"
            fill="black"
          />
          <path
            d="M16.8462 20.5337L20.4662 24.1537C20.5099 24.1975 20.5656 24.2273 20.6263 24.2394C20.687 24.2515 20.7499 24.2453 20.8071 24.2216C20.8642 24.1979 20.9131 24.1578 20.9474 24.1063C20.9817 24.0548 21 23.9943 20.9999 23.9324V21.2499H25.0624C25.311 21.2499 25.5495 21.1511 25.7253 20.9753C25.9011 20.7995 25.9999 20.561 25.9999 20.3124C25.9999 20.0638 25.9011 19.8253 25.7253 19.6495C25.5495 19.4737 25.311 19.3749 25.0624 19.3749H20.9999V16.6924C21 16.6305 20.9817 16.57 20.9474 16.5185C20.9131 16.467 20.8642 16.4269 20.8071 16.4032C20.7499 16.3795 20.687 16.3733 20.6263 16.3854C20.5656 16.3975 20.5099 16.4273 20.4662 16.4712L16.8462 20.0912C16.8171 20.1202 16.794 20.1547 16.7782 20.1926C16.7625 20.2306 16.7543 20.2713 16.7543 20.3124C16.7543 20.3535 16.7625 20.3942 16.7782 20.4322C16.794 20.4701 16.8171 20.5046 16.8462 20.5337ZM20.0999 13.4749C20.1869 13.3879 20.2559 13.2846 20.303 13.1709C20.3501 13.0573 20.3743 12.9354 20.3743 12.8124C20.3743 12.6894 20.3501 12.5675 20.303 12.4539C20.2559 12.3402 20.1869 12.2369 20.0999 12.1499C20.0129 12.0629 19.9096 11.9939 19.7959 11.9468C19.6823 11.8997 19.5604 11.8755 19.4374 11.8755C19.3144 11.8755 19.1925 11.8997 19.0789 11.9468C18.9652 11.9939 18.8619 12.0629 18.7749 12.1499L15.0624 15.8612L13.2249 14.0249C13.1379 13.9379 13.0346 13.8689 12.9209 13.8218C12.8073 13.7747 12.6854 13.7505 12.5624 13.7505C12.4394 13.7505 12.3175 13.7747 12.2039 13.8218C12.0902 13.8689 11.9869 13.9379 11.8999 14.0249C11.8129 14.1119 11.7439 14.2152 11.6968 14.3289C11.6497 14.4425 11.6255 14.5644 11.6255 14.6874C11.6255 14.8104 11.6497 14.9323 11.6968 15.0459C11.7439 15.1596 11.8129 15.2629 11.8999 15.3499L14.3999 17.8499C14.5757 18.0255 14.814 18.1241 15.0624 18.1241C15.3108 18.1241 15.5491 18.0255 15.7249 17.8499L20.0999 13.4749Z"
            fill="black"
          />
        </g>
        <defs>
          <clipPath id="clip0_2693_8254">
            <rect
              width="20"
              height="20"
              fill="white"
              transform="translate(6 5)"
            />
          </clipPath>
        </defs>
      </svg>
    ),
    svg: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask
          id="mask0_2693_8268"
          maskUnits="userSpaceOnUse"
          x="1"
          y="0"
          width="18"
          height="20"
        >
          <path
            d="M10.0001 1.6665L12.1889 3.26317L14.8985 3.25817L15.7305 5.8365L17.9255 7.42484L17.0835 9.99984L17.9255 12.5748L15.7305 14.1632L14.8985 16.7415L12.1889 16.7365L10.0001 18.3332L7.81137 16.7365L5.10179 16.7415L4.26971 14.1632L2.07471 12.5748L2.91679 9.99984L2.07471 7.42484L4.26971 5.8365L5.10179 3.25817L7.81137 3.26317L10.0001 1.6665Z"
            fill="white"
            stroke="white"
            stroke-width="1.66667"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M7.0835 9.99984L9.16683 12.0832L13.3335 7.9165"
            stroke="black"
            stroke-width="1.66667"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </mask>
        <g mask="url(#mask0_2693_8268)">
          <path d="M0 0H20V20H0V0Z" fill="#018A13" />
        </g>
      </svg>
    ),
  },
  {
    title: "Average Duration",
    value: "42 mins",
    chipClass: "bg-fuchsia-100 text-fuchsia-700",
    iconClass: "text-fuchsia-600",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#D9D9D9" />
        <path
          d="M21.8335 22.0832C21.3346 22.0832 20.8941 21.9271 20.5118 21.6148C20.1296 21.3026 19.8921 20.9032 19.7993 20.4165H15.1668C14.3568 20.4165 13.6682 20.1329 13.101 19.5657C12.5338 18.9984 12.2502 18.3098 12.2502 17.4998C12.2502 16.6898 12.5338 16.0012 13.101 15.434C13.6682 14.8668 14.3568 14.5832 15.1668 14.5832H16.8335C17.4063 14.5832 17.8968 14.379 18.3052 13.9707C18.7129 13.5618 18.9168 13.0704 18.9168 12.4965C18.9168 11.9226 18.7129 11.4326 18.3052 11.0265C17.8974 10.6204 17.4068 10.4171 16.8335 10.4165H12.2002C12.1057 10.9026 11.8679 11.3021 11.4868 11.6148C11.1057 11.9276 10.6657 12.0837 10.1668 12.0832C9.58794 12.0832 9.09627 11.8809 8.69183 11.4765C8.28627 11.0715 8.0835 10.5798 8.0835 10.0015C8.0835 9.42317 8.28627 8.93123 8.69183 8.52567C9.09738 8.12011 9.58905 7.91706 10.1668 7.9165C10.6657 7.9165 11.1057 8.07289 11.4868 8.38567C11.8674 8.69789 12.1054 9.09706 12.201 9.58317H16.8335C17.6435 9.58317 18.3321 9.86678 18.8993 10.434C19.4666 11.0012 19.7502 11.6898 19.7502 12.4998C19.7502 13.3098 19.4666 13.9984 18.8993 14.5657C18.3321 15.1329 17.6435 15.4165 16.8335 15.4165H15.1668C14.5941 15.4165 14.1035 15.6209 13.6952 16.0298C13.2874 16.4382 13.0835 16.9293 13.0835 17.5032C13.0835 18.0771 13.2877 18.5671 13.696 18.9732C14.1038 19.3798 14.5941 19.5832 15.1668 19.5832H19.8002C19.8946 19.0971 20.1324 18.6979 20.5135 18.3857C20.8946 18.0734 21.3346 17.9171 21.8335 17.9165C22.4124 17.9165 22.9041 18.119 23.3085 18.524C23.7141 18.9284 23.9168 19.4198 23.9168 19.9982C23.9168 20.5765 23.7141 21.0684 23.3085 21.474C22.9029 21.8796 22.4113 22.0826 21.8335 22.0832ZM10.1668 11.2498C10.5096 11.2498 10.8038 11.1273 11.0493 10.8823C11.2943 10.6368 11.4168 10.3426 11.4168 9.99984C11.4168 9.65706 11.2943 9.36289 11.0493 9.11734C10.8038 8.87234 10.5096 8.74984 10.1668 8.74984C9.82405 8.74984 9.52988 8.87234 9.28433 9.11734C9.03933 9.36289 8.91683 9.65706 8.91683 9.99984C8.91683 10.3426 9.03933 10.6368 9.28433 10.8823C9.52988 11.1273 9.82405 11.2498 10.1668 11.2498Z"
          fill="black"
        />
      </svg>
    ),
    svg: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_2693_8237)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10.0056 0.416504C4.70935 0.416504 0.416016 4.70984 0.416016 10.0061C0.416016 14.6873 3.77018 18.5844 8.20643 19.4269C8.72602 19.5257 9.17185 19.1153 9.17185 18.6169V16.7828C9.17185 16.3786 8.88643 16.0515 8.51977 15.9603C5.84893 15.2961 3.86977 12.8815 3.86977 10.0061C3.86977 6.61734 6.61685 3.87067 10.0056 3.87067C12.9156 3.87067 15.3531 5.89692 15.9827 8.6165C16.0689 8.98859 16.3985 9.28192 16.8085 9.28192H18.6364C19.131 9.28192 19.5393 8.84275 19.4481 8.32609C18.6539 3.83109 14.7289 0.416504 10.0056 0.416504ZM14.1389 15.4273C13.8564 15.1444 13.4281 15.1123 13.1056 15.3019C12.6017 15.5978 12.0578 15.8195 11.4906 15.9603C11.1239 16.0515 10.8389 16.3786 10.8389 16.7828V18.6169C10.8389 19.1153 11.2848 19.5253 11.8043 19.4269C13.0621 19.1879 14.259 18.6982 15.3235 17.9869C15.766 17.6915 15.7939 17.0819 15.4393 16.7273L14.1389 15.4273ZM15.9377 11.5778C16.0364 11.2219 16.3589 10.9486 16.7543 10.9486H18.5952C19.0973 10.9486 19.5093 11.4011 19.4031 11.9236C19.1453 13.1949 18.6305 14.4001 17.8902 15.4653C17.5902 15.8978 16.9889 15.9203 16.6385 15.5698L15.3448 14.2761C15.0585 13.9898 15.0293 13.5565 15.2248 13.2332L15.2348 13.2153C15.2869 13.1223 15.3383 13.029 15.3889 12.9353C15.4831 12.7611 15.5848 12.5653 15.6398 12.4382C15.6952 12.3107 15.7689 12.0994 15.8319 11.9082C15.8661 11.8049 15.8994 11.7012 15.9318 11.5973L15.9377 11.5778Z"
            fill="#9A0367"
          />
        </g>
        <defs>
          <clipPath id="clip0_2693_8237">
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
  },
] as const;

const programPerformance = [
  { name: 'Advanced Cybersecurity (AC Series)', students: 0, averageScore: '0%', percentTotal: '0%' },
  { name: 'Business Process & Operations (BP Series)', students: 0, averageScore: '0%', percentTotal: '0%' },
  { name: 'Cybersecurity Fundamentals (CS Series)', students: 0, averageScore: '0%', percentTotal: '0%' },
  { name: 'Emerging Technologies (ET Series)', students: 0, averageScore: '0%', percentTotal: '0%' },
];

const performanceTrends = [
  { label: 'CY', value: 180 },
  { label: 'AD', value: 230 },
  { label: 'BU', value: 160 },
  { label: 'PM', value: 270 },
  { label: 'SD', value: 120 },
];

const participantGrowth = [
  { label: 'Jan', value: 90 },
  { label: 'Feb', value: 380 },
  { label: 'Mar', value: 140 },
  { label: 'Apr', value: 520 },
  { label: 'May', value: 210 },
];

const departmentDistribution = [
  { name: 'Technology', value: 60, color: '#16a34a' },
  { name: 'Business', value: 25, color: '#2563eb' },
  { name: 'Cybersecurity', value: 15, color: '#f59e0b' },
];

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card className="border-none bg-transparent space-y-6 shadow-none">
          <div className=" bg-white p-6 rounded-xl space-y-6">
            <CardHeader className="pb-3 p-0">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold text-slate-900">
                    Analytics & Insights
                  </CardTitle>
                  <CardDescription className="text-slate-500 mt-1">
                    Track performance metrics and assessment analytics.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="30d">
                    <SelectTrigger className="w-[140px] h-9 rounded-lg border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="h-9 rounded-lg bg-[#155dfc] hover:bg-[#0d4bc4]">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.title} className="border-none bg-[#F6F7F9]">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      {metric.icon}
                      <span className="text-sm">{metric.title}</span>
                    </div>
                    <div
                      className={`mt-4 w-fit rounded-full px-3 py-1 text-sm font-semibold flex justify-center items-center gap-2 ${metric.chipClass}`}
                    >
                      {metric.svg}
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <CardContent className="space-y-6 p-0 border-none">
            <Card className="border-none rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-700" />
                  <CardTitle className="text-xl text-slate-900">
                    Program Performance
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-500">
                  Student distribution performance across programs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {programPerformance.map((program, index) => (
                  <div
                    key={program.name}
                    className="grid grid-cols-12 items-center rounded-lg border border-none bg-[#F6F7F9] px-4 py-3 gap-2 text-sm"
                  >
                    <div className="col-span-1 text-slate-500 font-medium">
                      {index + 1}
                    </div>
                    <div className="col-span-5 font-semibold text-slate-900 truncate">
                      {program.name}
                    </div>
                    <div className="col-span-2 text-slate-700">
                      {program.students} students
                    </div>
                    <div className="col-span-2 text-slate-700">
                      {program.averageScore} Average Score
                    </div>
                    <div className="col-span-2 text-slate-700">
                      {program.percentTotal} of total
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="border-none rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900">
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceTrends}>
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#155dfc"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900">
                    Participant Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={participantGrowth}>
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#155dfc"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900">
                    Department Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {departmentDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-600 mt-2">
                    {departmentDistribution.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-1.5"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

