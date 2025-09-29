import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
    schema: path.join('core/db', 'schema.prisma'),
    migrations: {
        path: path.join('core/db', 'migrations'),
    },
    views: {
        path: path.join('core/db', 'views'),
    },
    typedSql: {
        path: path.join('core/db', 'queries'),
    },
})
