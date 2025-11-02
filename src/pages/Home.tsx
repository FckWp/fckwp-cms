import InlineEditor from '../components/Editor';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Üdv a honlapon!</h1>
      <InlineEditor recordKey="home-subtitle" type="string">
        {(value) => (
          <h2 className="mt-4 text-xl text-gray-600">
            {value || 'Másodlagos cím'}
          </h2>
        )}
      </InlineEditor>
    </div>
  );
}

