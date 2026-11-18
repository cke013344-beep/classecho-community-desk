import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{
 owner:text('owner').notNull(),id:text('id').notNull(),payload:text('payload').notNull(),rev:integer('rev').notNull(),mutation:text('mutation').notNull(),updated:text('updated').notNull()
},t=>[primaryKey({columns:[t.owner,t.id]})]);
