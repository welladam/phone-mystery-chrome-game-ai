/** Visible catalogs and shared narrative for the pt-BR locale. */
import * as manifest from "../../content/manifest";
import * as shared from "../../content/shared";
import * as dossier from "../../content/dossier";
import * as hints from "../../engine/hints";
import { NOTEBOOK_PEOPLE } from "./notebook";

export const ptBRContent = { manifest, shared, dossier, hints, notebookPeople: NOTEBOOK_PEOPLE };
export type PtBRContent = typeof ptBRContent;
