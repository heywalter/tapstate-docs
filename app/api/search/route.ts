import { getPublicDocPages, source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false;

const publicSearchSource = new Proxy(source, {
  get(target, property, receiver) {
    if (property === 'getPages') {
      return () => getPublicDocPages();
    }
    return Reflect.get(target, property, receiver);
  },
});

export const { staticGET: GET } = createFromSource(publicSearchSource, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});
