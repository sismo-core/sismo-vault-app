type Props = {
  size: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function SismoRounded({ size, color, className, style }: Props): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={style}
      viewBox="0 0 33 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.3896 19.6264C11.3896 16.7294 13.73 14.3527 16.6513 14.3527C19.5726 14.3527 21.9129 16.7294 21.9129 19.6264C21.9129 22.5233 19.5726 24.9 16.6513 24.9C13.73 24.9 11.3896 22.5233 11.3896 19.6264Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.6362 32C25.4728 32 32.6362 24.8366 32.6362 16C32.6362 7.16344 25.4728 0 16.6362 0C7.79967 0 0.63623 7.16344 0.63623 16C0.63623 24.8366 7.79967 32 16.6362 32ZM15.5735 4V8.74871C14.3748 8.86763 13.2323 9.18279 12.1786 9.66215L9.80969 5.53696L7.95017 6.64944L10.3061 10.7521C7.56536 12.7374 5.77623 15.9762 5.77623 19.6458H7.93164C7.93164 14.8289 11.8201 10.8955 16.6512 10.8955C21.4824 10.8955 25.3708 14.8289 25.3708 19.6458H27.5262C27.5262 15.9762 25.7371 12.7373 22.9963 10.752L25.352 6.6494L23.4924 5.537L21.1238 9.66213C20.0702 9.18278 18.9277 8.86762 17.7289 8.74871V4H15.5735ZM16.6513 12.1527C12.5704 12.1527 9.23424 15.4832 9.23424 19.6264C9.23424 23.7695 12.5704 27.1 16.6513 27.1C20.7322 27.1 24.0683 23.7695 24.0683 19.6264C24.0683 15.4832 20.7322 12.1527 16.6513 12.1527Z"
        fill={color}
      />
    </svg>
  );
}
