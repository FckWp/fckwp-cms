import PocketBase from 'pocketbase';

const baseUrl = import.meta.env.VITE_PB_API_URL;
const pb = new PocketBase(baseUrl);

pb.autoCancellation(false);

export default pb;

export async function fetchPageBySlug(slug: string) {
  const list = await pb.collection('pages').getFullList(1, { filter: `slug="${slug}"` });
  if (list.length === 0) throw new Error('Page not found');
  return list[0];
}

export async function patchBlock(pageId: string, blockId: string, updatedFields: Record<string, any>) {
  const record = await pb.collection('pages').getOne(pageId);
  const structure: any[] = record.structure || [];
  const newStructure = structure.map(b => (b.id === blockId ? { ...b, ...updatedFields } : b));
  return pb.collection('pages').update(pageId, { structure: newStructure });
}