type Props = {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function EthereumLogo({
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
      <path d="M16.1613 1L7 16.0955L16.1613 21.6369L25.3871 16.0955L16.1613 1Z" />
      <path d="M16.1613 31L7 18.1338L16.1613 23.3567L25.3871 18.1338L16.1613 31Z" />
    </svg>
  );
}
