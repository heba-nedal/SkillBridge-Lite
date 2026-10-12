import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const s = z.string().max(5000);
const Input = z.object({
  profile: z.object({ name: s, headline: s, about: s, skills: s, projects: s, experience: s }),
  opportunityId: z.string().max(200),
});

export const analyzeFitFn = createServerFn({ method: "POST" })
  .inputValidator((data) => Input.parse(data))
  .handler(async ({ data }) => {
    const { getOpportunity } = await import("./opportunities");
    const { analyzeFit } = await import("./fit-analysis.server");
    const opportunity = getOpportunity(data.opportunityId);
    if (!opportunity) return { ok: false as const, kind: "error" as const, message: "This opportunity could not be found." };
    return analyzeFit(data.profile, opportunity);
  });
