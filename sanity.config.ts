// Sanity Studio — the editing portal, served at /admin once a project ID is set (src/sanity/env.ts).
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schema';
import { projectId, dataset } from './src/sanity/env';

export default defineConfig({
  name: 'maaru',
  title: 'maaru.',
  projectId: projectId || 'not-configured',
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('maaru.')
          .items([
            S.documentTypeListItem('journal').title('Journal'),
            S.documentTypeListItem('visual').title('Visuals'),
            S.documentTypeListItem('frequency').title('Frequencies'),
            S.documentTypeListItem('place').title('Elsewhere'),
            S.documentTypeListItem('experiment').title('Experiments'),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
