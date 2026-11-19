import Image from "next/image";
import Link, { type LinkProps } from "next/link";
import mark from "../../../public/assets/leadmate-mark-white.png";
import { cn } from "@/lib/utils";

/**
 * The mark ships as a white glyph on a solid brand-green square with no alpha
 * channel, so it is used as a tile rather than floated on the page background.
 * That is also how it reads best at favicon and avatar sizes.
 */
export function LogoMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={mark}
      alt=""
      width={size}
      height={size}
      priority
      className={cn("rounded-[7px] object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function Logo<RouteType = "/">({
  href = "/" as LinkProps<RouteType>["href"],
  size = 28,
  className,
}: {
  href?: LinkProps<RouteType>["href"];
  size?: number;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="text-[15px] font-semibold tracking-tight text-fg">aLeadMate</span>
    </Link>
  );
}
