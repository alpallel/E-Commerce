import { useSelection } from "./context/SelectionContext.jsx";

function Counter({ onRemoveSelected }) {
  const { getCount, clearSelected } = useSelection();
  const count = getCount();

  return (
    <div className="bg-sky-50 w-full bottom-0 fixed flex flex-row gap-6 justify-end">
      <h3 className="self-center text-xl mr-2">Selected Item {count}</h3>
      <button
        className="bg-red-600 rounded-md p-2 m-3 text-lg font-semibold self-center mr-5"
        onClick={() => {
          if (onRemoveSelected) onRemoveSelected();
          else clearSelected();
        }}
      >
        Remove all
      </button>
    </div>
  );
}

export default Counter;
