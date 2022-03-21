import { useState } from "react";
import Modal from "react-modal";
import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import { GearIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

import utils from "../../../common/lib/utils";

import Button from "../Button";
import Menu from "../Menu";
import TextField from "../Form/TextField";

type Props = {
  allowance: {
    id: string;
    totalBudget: number;
  };
  onEdit?: () => void;
  onDelete?: () => void;
};

function AllowanceMenu({ allowance, onEdit, onDelete }: Props) {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [budget, setBudget] = useState("0");

  function openModal() {
    setBudget(allowance.totalBudget.toString());
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  async function updateAllowance() {
    await utils.call("updateAllowance", {
      id: parseInt(allowance.id),
      totalBudget: parseInt(budget),
    });
    onEdit && onEdit();
    closeModal();
  }

  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center text-gray-500 hover:text-black transition-color duration-200 dark:hover:text-white">
          <GearIcon className="h-6 w-6" />
        </Menu.Button>
        <Menu.List position="right">
          <Menu.ItemButton onClick={openModal}>Edit</Menu.ItemButton>
          <Menu.ItemButton
            onClick={async () => {
              if (
                window.confirm("Are you sure you want to delete this website?")
              ) {
                try {
                  await utils.call("deleteAllowance", {
                    id: parseInt(allowance.id),
                  });
                  onDelete && onDelete();
                } catch (e) {
                  console.error(e);
                }
              }
            }}
          >
            Delete
          </Menu.ItemButton>
        </Menu.List>
      </Menu>
      <Modal
        closeTimeoutMS={200}
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Allowance Options"
        overlayClassName="bg-black bg-opacity-25 fixed inset-0 flex justify-center items-center p-5"
        className="rounded-lg bg-white w-full max-w-lg"
      >
        <div className="p-5 flex justify-between dark:bg-gray-800">
          <h2 className="text-2xl font-bold dark:text-white">Edit Allowance</h2>
          <button onClick={closeModal}>
            <CrossIcon className="w-6 h-6 dark:text-white" />
          </button>
        </div>
        <div className="p-5 border-t border-b border-gray-200 dark:bg-gray-800 dark:border-gray-500">
          <div className="w-60">
            <TextField
              id="budget"
              label="Budget"
              placeholder="sat"
              value={budget}
              type="number"
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end p-5 dark:bg-gray-800">
          <Button
            onClick={updateAllowance}
            label="Save"
            primary
            disabled={budget === ""}
          />
        </div>
      </Modal>
    </>
  );
}

export default AllowanceMenu;
