import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { getConnectorDocumentationStatus } from '@/lib/connector-directory';

export const revalidate = false;

const publicSearchSource = new Proxy(source, {
  get(target, property, receiver) {
    if (property === 'getPages') {
      return () => target.getPages().filter((page) => {
        if (page.slugs[0] !== 'connectors' || page.slugs.length < 2) return true;
        return getConnectorDocumentationStatus(page.slugs[1]) !== 'unlisted';
      });
    }
    return Reflect.get(target, property, receiver);
  },
});

export const { staticGET: GET } = createFromSource(publicSearchSource, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});
