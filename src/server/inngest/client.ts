import { Inngest } from "inngest";
import { schemas } from "./inngest-types";

export const inngestClient = new Inngest({ id: "justblue", schemas: schemas });
