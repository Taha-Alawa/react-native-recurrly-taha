import { colors } from "@/core/theme/tokens";
import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import adobe from "@/assets/icons/adobe.png";
import back from "@/assets/icons/back.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import dropbox from "@/assets/icons/dropbox.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import home from "@/assets/icons/home.png";
import medium from "@/assets/icons/medium.png";
import menu from "@/assets/icons/menu.png";
import netflix from "@/assets/icons/netflix.png";
import notion from "@/assets/icons/notion.png";
import openai from "@/assets/icons/openai.png";
import plus from "@/assets/icons/plus.png";
import setting from "@/assets/icons/setting.png";
import spotify from "@/assets/icons/spotify.png";
import wallet from "@/assets/icons/wallet.png";

export const icons = {
  home,
  wallet,
  setting,
  activity,
  add,
  back,
  menu,
  plus,
  netflix,
  notion,
  dropbox,
  openai,
  adobe,
  medium,
  figma,
  spotify,
  github,
  claude,
  canva,
} as const;

export type IconKey = keyof typeof icons;

/**
 * Icons drawn as white artwork, because they were made for the dark tab bar.
 * Anywhere else — a card, any light surface — they disappear unless tinted.
 *
 * The brand logos are deliberately absent: those are navy artwork with white
 * cut-outs (the Spotify bars, the Netflix notch), so tinting one would fill its
 * cut-out in and flatten the logo into a solid blob.
 */
const LIGHT_ARTWORK: IconKey[] = ["home", "wallet", "setting", "activity"];

/**
 * The tintColor an icon needs on a light surface, or undefined when its own
 * artwork already reads there. Pass the result straight to an Image style —
 * undefined leaves the asset untouched.
 *
 * The wallet glyph matters most: it is the fallback icon and the default for
 * every subscription added in the app, so without this most cards show nothing.
 */
export const iconTint = (
  iconKey?: string,
  color: string = colors.primary,
): string | undefined =>
  LIGHT_ARTWORK.includes(iconKey as IconKey) ? color : undefined;
