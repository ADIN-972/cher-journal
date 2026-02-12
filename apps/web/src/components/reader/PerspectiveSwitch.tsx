import { useReaderStore } from '../../stores/readerStore';

export default function PerspectiveSwitch() {
  const { perspective, changePerspective, isLoading } = useReaderStore();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Perspective</h3>
          <p className="text-xs text-gray-500">
            Choisissez votre point de vue de lecture
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => changePerspective('narrator')}
            disabled={isLoading || perspective === 'narrator'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              perspective === 'narrator'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            Narrateur
          </button>

          <button
            onClick={() => changePerspective('protagonist')}
            disabled={isLoading || perspective === 'protagonist'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              perspective === 'protagonist'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            Protagoniste
          </button>
        </div>
      </div>
    </div>
  );
}
