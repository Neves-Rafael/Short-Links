import fastify from "fastify";
import { z } from "zod"
import { sql } from "./lib/postgres";
import postgres from "postgres";

const app = fastify();

app.get("/links", async () => {
  const result = await sql`
    SELECT * 
    FROM short_links
    ORDER BY created_at DESC
  `;

  return result

})

app.post("/links", async (request, reply)=>{
  const codeSchema = z.object({
    code: z.string().min(3),
    url: z.string().url(),
  });

  const { code, url } = codeSchema.parse(request.body); 
  
  try {
    const result = await sql`
    INSERT INTO short_links (code, original_url)
    VALUES (${code}, ${url})
    RETURNING id
  `;
  
  const link =  result[0]

  return reply.status(201).send({
    shortLinkId: link.id
  })
  } catch (error) {
    if(error instanceof postgres.PostgresError){
      if(error.code === "23505"){
        return reply.status(400).send({ message: "Duplicated code!" })
      }
    }

    console.error(error)

    return reply.status(500).send({ message: "Internal error" })
  }

})

app.listen({
  port: 3333,
}).then(() => {
  console.log("server Running!")
});