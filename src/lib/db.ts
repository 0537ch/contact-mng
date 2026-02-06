import postgres from 'postgres'

let sql: postgres.Sql<Record<string, never>> | null = null

export function getDb() {
  if (!sql) {
    const url = process.env.DATABASE_URL

    if (!url) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    sql = postgres(url, {
      ssl: 'require',
      prepare: false,  
    })
  }

  return sql
}

export type Contact = {
    id:number;
    name:string;
    email:string | null;
    address:string|null;
    nik:string|null;
    npwp:string|null;
    phone:string | null;
    is_coordinator:boolean;
    is_company:boolean ;
    parent_id:number | null;
    parent_name: string | null;
    parent_email:string | null;
}