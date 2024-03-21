import postgres from "postgres";

export const sql = postgres("postgressql://docker:docker@localhost:5432/shortlinks")