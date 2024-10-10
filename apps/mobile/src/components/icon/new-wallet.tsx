import React, { FunctionComponent } from "react";
import Svg, { Path, Rect } from "react-native-svg";

export const NewWalletSquareIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size = 38 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Rect width="38" height="38" rx="6" fill="#E2DEEB" />
      <Path
        d="M19 29.75C13.07 29.75 8.25 24.93 8.25 19C8.25 13.07 13.07 8.25 19 8.25C24.93 8.25 29.75 13.07 29.75 19C29.75 24.93 24.93 29.75 19 29.75ZM19 9.75C13.9 9.75 9.75 13.9 9.75 19C9.75 24.1 13.9 28.25 19 28.25C24.1 28.25 28.25 24.1 28.25 19C28.25 13.9 24.1 9.75 19 9.75Z"
        fill="#8B1BFB"
      />
      <Path
        d="M23 19.75H15C14.59 19.75 14.25 19.41 14.25 19C14.25 18.59 14.59 18.25 15 18.25H23C23.41 18.25 23.75 18.59 23.75 19C23.75 19.41 23.41 19.75 23 19.75Z"
        fill="#8B1BFB"
      />
      <Path
        d="M19 23.75C18.59 23.75 18.25 23.41 18.25 23V15C18.25 14.59 18.59 14.25 19 14.25C19.41 14.25 19.75 14.59 19.75 15V23C19.75 23.41 19.41 23.75 19 23.75Z"
        fill="#8B1BFB"
      />
    </Svg>
  );
};

export const ExistingWalletSquareIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size = 38 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Rect width="38" height="38" rx="6" fill="#E2DEEB" />
      <Path
        d="M20.8002 17.95C20.6102 17.95 20.4202 17.88 20.2702 17.73C19.9802 17.44 19.9802 16.96 20.2702 16.67L28.4702 8.47C28.7602 8.18 29.2402 8.18 29.5302 8.47C29.8202 8.76 29.8202 9.24 29.5302 9.53L21.3302 17.73C21.1902 17.87 21.0002 17.95 20.8002 17.95Z"
        fill="#8B1BFB"
      />
      <Path
        d="M24.83 18.75H20C19.59 18.75 19.25 18.41 19.25 18V13.17C19.25 12.76 19.59 12.42 20 12.42C20.41 12.42 20.75 12.76 20.75 13.17V17.25H24.83C25.24 17.25 25.58 17.59 25.58 18C25.58 18.41 25.24 18.75 24.83 18.75Z"
        fill="#8B1BFB"
      />
      <Path
        d="M22 29.75H16C10.57 29.75 8.25 27.43 8.25 22V16C8.25 10.57 10.57 8.25 16 8.25H18C18.41 8.25 18.75 8.59 18.75 9C18.75 9.41 18.41 9.75 18 9.75H16C11.39 9.75 9.75 11.39 9.75 16V22C9.75 26.61 11.39 28.25 16 28.25H22C26.61 28.25 28.25 26.61 28.25 22V20C28.25 19.59 28.59 19.25 29 19.25C29.41 19.25 29.75 19.59 29.75 20V22C29.75 27.43 27.43 29.75 22 29.75Z"
        fill="#8B1BFB"
      />
    </Svg>
  );
};

export const LedgerNanoWalletSquareIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size = 38 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Rect width="38" height="38" rx="6" fill="#E2DEEB" />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.86816 10.8764C8.86816 10.4622 9.20395 10.1264 9.61816 10.1264H16.4998C16.914 10.1264 17.2498 10.4622 17.2498 10.8764C17.2498 11.2906 16.914 11.6264 16.4998 11.6264H10.3682V15.2566C10.3682 15.6709 10.0324 16.0066 9.61816 16.0066C9.20395 16.0066 8.86816 15.6709 8.86816 15.2566V10.8764Z"
        fill="#8B1BFB"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M29.1646 27.1112C29.1646 27.5255 28.8288 27.8612 28.4146 27.8612L21.5329 27.8612C21.1187 27.8612 20.7829 27.5254 20.7829 27.1112C20.7829 26.697 21.1187 26.3612 21.5329 26.3612L27.6646 26.3612L27.6646 22.731C27.6646 22.3168 28.0003 21.981 28.4146 21.981C28.8288 21.981 29.1646 22.3168 29.1646 22.731L29.1646 27.1112Z"
        fill="#8B1BFB"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M17.1528 22.8882C16.7386 22.8882 16.4028 22.5525 16.4028 22.1382L16.4028 15.2566C16.4028 14.8424 16.7386 14.5066 17.1528 14.5066C17.567 14.5066 17.9028 14.8424 17.9028 15.2566L17.9028 21.3882L21.533 21.3882C21.9473 21.3882 22.283 21.724 22.283 22.1382C22.283 22.5525 21.9473 22.8882 21.533 22.8882L17.1528 22.8882Z"
        fill="#8B1BFB"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.86816 27.1112C8.86816 27.5255 9.20395 27.8612 9.61816 27.8612L16.4998 27.8612C16.914 27.8612 17.2498 27.5254 17.2498 27.1112C17.2498 26.697 16.914 26.3612 16.4998 26.3612L10.3682 26.3612L10.3682 22.731C10.3682 22.3168 10.0324 21.981 9.61816 21.981C9.20395 21.981 8.86816 22.3168 8.86816 22.731L8.86816 27.1112Z"
        fill="#8B1BFB"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M29.1646 10.8764C29.1646 10.4622 28.8288 10.1264 28.4146 10.1264L21.5329 10.1264C21.1187 10.1264 20.7829 10.4622 20.7829 10.8764C20.7829 11.2906 21.1187 11.6264 21.5329 11.6264L27.6646 11.6264L27.6646 15.2566C27.6646 15.6709 28.0003 16.0066 28.4146 16.0066C28.8288 16.0066 29.1646 15.6709 29.1646 15.2566L29.1646 10.8764Z"
        fill="#8B1BFB"
      />
    </Svg>
  );
};

export const BookMnemonicSeedIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color = "none", size = 16 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3.53049 2.53034C3.269 2.79183 3.0835 3.32798 3.0835 4.66668V12C3.0835 12.4142 2.74771 12.75 2.3335 12.75C1.91928 12.75 1.5835 12.4142 1.5835 12V4.66668C1.5835 3.3387 1.73133 2.20819 2.46983 1.46968C3.20834 0.731174 4.33886 0.583344 5.66683 0.583344H10.3335C11.6615 0.583344 12.792 0.731174 13.5305 1.46968C14.269 2.20819 14.4168 3.3387 14.4168 4.66668V11.3422C14.4168 11.4301 14.4169 11.5464 14.4083 11.6668C14.3787 12.0799 14.0199 12.3909 13.6067 12.3614C13.1936 12.3319 12.8826 11.9731 12.9121 11.5599C12.9165 11.4977 12.9168 11.4311 12.9168 11.3333V4.66668C12.9168 3.32798 12.7313 2.79183 12.4698 2.53034C12.2083 2.26885 11.6722 2.08334 10.3335 2.08334H5.66683C4.32814 2.08334 3.79199 2.26885 3.53049 2.53034Z"
        fill="#5F5E77"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.2335 10.75C3.60104 10.75 3.0835 11.2675 3.0835 11.9V12.3333C3.0835 13.2058 3.79438 13.9167 4.66683 13.9167H11.3335C12.2059 13.9167 12.9168 13.2058 12.9168 12.3333V10.75H4.2335ZM1.5835 11.9C1.5835 10.4391 2.77262 9.25 4.2335 9.25H13.6668C14.081 9.25 14.4168 9.58579 14.4168 10V12.3333C14.4168 14.0342 13.0344 15.4167 11.3335 15.4167H4.66683C2.96595 15.4167 1.5835 14.0342 1.5835 12.3333V11.9Z"
        fill="#5F5E77"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.5835 4.66666C4.5835 4.25245 4.91928 3.91666 5.3335 3.91666H10.6668C11.081 3.91666 11.4168 4.25245 11.4168 4.66666C11.4168 5.08088 11.081 5.41666 10.6668 5.41666H5.3335C4.91928 5.41666 4.5835 5.08088 4.5835 4.66666Z"
        fill="#5F5E77"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.5835 7C4.5835 6.58579 4.91928 6.25 5.3335 6.25H8.66683C9.08104 6.25 9.41683 6.58579 9.41683 7C9.41683 7.41421 9.08104 7.75 8.66683 7.75H5.3335C4.91928 7.75 4.5835 7.41421 4.5835 7Z"
        fill="#5F5E77"
      />
    </Svg>
  );
};