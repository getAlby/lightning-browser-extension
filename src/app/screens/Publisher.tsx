import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Modal from "react-modal";

import utils from "../../common/lib/utils";
import PublisherCard from "../components/PublisherCard";
import Progressbar from "../components/Shared/progressbar";
import TransactionsTable from "../components/TransactionsTable";

dayjs.extend(relativeTime);

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#options-root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

function Publisher() {
  const [allowance, setAllowance] = useState({
    host: "",
    imageURL: "",
    remainingBudget: 0,
    usedBudget: 0,
    totalBudget: 0,
    payments: [],
  });
  const [modalIsOpen, setIsOpen] = useState(false);
  const { id } = useParams();

  async function fetchData() {
    try {
      const response = await utils.call("getAllowanceById", {
        id: parseInt(id),
      });
      console.log(response);
      setAllowance(response);
    } catch (e) {
      console.log(e.message);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div>
      <PublisherCard title={allowance.host} image={allowance.imageURL} />
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 border-b border-grey-200">
          <div className="flex">
            <dl>
              <dt className="text-sm">Allowance</dt>
              <dd className="text-sm text-gray-500">
                {allowance.usedBudget} / {allowance.totalBudget} sats
              </dd>
            </dl>
            <button onClick={openModal}>Edit</button>
            <Modal
              isOpen={modalIsOpen}
              // onAfterOpen={afterOpenModal}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Example Modal"
              overlayClassName="bg-black bg-opacity-25 fixed inset-0"
            >
              <h2>Hello</h2>
              <button onClick={closeModal}>close</button>
              <div>I am a modal</div>
            </Modal>
          </div>

          <div className="w-24">
            <Progressbar percentage={allowance.percentage} />
          </div>
        </div>

        <div>
          <TransactionsTable
            transactions={allowance.payments.map((payment) => ({
              ...payment,
              type: "sent",
              date: dayjs(payment.createdAt).fromNow(),
              // date: dayjs.unix(payment.createdAt),
              title: payment.description,
              subTitle: `${payment.name} @ ${payment.location}`,
              currency: "€",
              value: 9.99,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

export default Publisher;
