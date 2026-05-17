/**
 * Minimal content-block → Markdown converter for the agent-friendly
 * `/blog/[slug]/llms.txt` view. Handles the block types the seed content and
 * the FavCRM CMS commonly emit; unknown types are skipped.
 */
import type { AnyBlock } from "@favcrm/sdk";

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

export function blocksToMarkdown(raw: string | null): string {
  if (!raw) return "";

  let blocks: AnyBlock[];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) blocks = parsed as AnyBlock[];
    else return stripHtml(raw); // raw was plain HTML, not a block array
  } catch {
    return stripHtml(raw);
  }

  const out: string[] = [];
  for (const block of blocks) {
    const data = block.data as Record<string, unknown>;
    switch (block.type) {
      case "paragraph":
        out.push(stripHtml(String(data.html ?? "")));
        break;
      case "heading": {
        const level = Number(data.level ?? 2);
        out.push(`${"#".repeat(level)} ${data.text ?? ""}`);
        break;
      }
      case "list": {
        const items = (data.items as string[]) ?? [];
        out.push(
          items
            .map((item, i) =>
              data.ordered ? `${i + 1}. ${item}` : `- ${item}`,
            )
            .join("\n"),
        );
        break;
      }
      case "quote":
        out.push(
          `> ${data.text ?? ""}${data.cite ? `\n> — ${data.cite}` : ""}`,
        );
        break;
      case "callout":
        out.push(`> **${data.title ?? "Note"}** — ${data.body ?? ""}`.trim());
        break;
      case "code":
        out.push(`\`\`\`\n${data.code ?? ""}\n\`\`\``);
        break;
      case "divider":
        out.push("---");
        break;
      case "image":
        out.push(`![${data.alt ?? ""}](${data.url ?? ""})`);
        break;
      case "html":
        out.push(stripHtml(String(data.html ?? "")));
        break;
      default:
        break;
    }
  }
  return out.filter(Boolean).join("\n\n");
}
