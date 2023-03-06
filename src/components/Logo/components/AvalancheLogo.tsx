type Props = {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function AvalancheLogo({
  size,
  color,
  className,
  style,
}: Props): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path d="M23.7175 19.1336C24.4754 17.8244 25.6985 17.8244 26.4565 19.1336L31.1765 27.4195C31.9345 28.7288 31.3143 29.7968 29.7984 29.7968H20.2894C18.7907 29.7968 18.1705 28.7288 18.9113 27.4195L23.7175 19.1336ZM14.5874 3.18192C15.3454 1.87271 16.5512 1.87271 17.3092 3.18192L18.36 5.07683L20.8406 9.43512C21.4436 10.6754 21.4436 12.1397 20.8406 13.38L12.5203 27.7985C11.7623 28.9699 10.5048 29.7107 9.10942 29.7968H2.20161C0.685682 29.7968 0.0655301 28.746 0.823494 27.4195L14.5874 3.18192Z" />
    </svg>
  );
}
