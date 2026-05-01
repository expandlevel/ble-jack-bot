import { Bot, type SessionFlavor, Context, session } from "grammy";

export interface SessionData {
  pageNumber: number;
  videoDownloadLinks: Map<string, string[]>;
}

export type MyContext = Context & SessionFlavor<SessionData>;

export interface FullVideoDetails {
  title: string;
  screenshots: string[];
  links: {
    quality: string;
    size: string;
    shadowLink: string;
    downloadLink: string;
  }[];
}
