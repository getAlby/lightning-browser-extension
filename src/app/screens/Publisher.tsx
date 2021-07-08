import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Modal from "react-modal";
import { DotsVerticalIcon } from "@heroicons/react/solid";

import utils from "../../common/lib/utils";
import Container from "../components/Container";
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
      <PublisherCard
        title={allowance.host}
        image={allowance.imageURL}
        url={`https://${allowance.host}`}
      />
      <Container>
        <div className="flex justify-between items-center py-3">
          <dl>
            <dt className="text-sm font-medium text-gray-500">Allowance</dt>
            <dd className="flex items-center font-bold text-xl">
              {allowance.usedBudget} / {allowance.totalBudget} sats
              <div className="ml-3 w-24">
                <Progressbar percentage={allowance.percentage} />
              </div>
            </dd>
          </dl>

          <button
            className="ml-1 inline-flex items-center focus:outline-none text-blue-500"
            onClick={openModal}
          >
            <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold">Settings</span>
          </button>
          <Modal
            closeTimeoutMS={200}
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Allowance Options"
            overlayClassName="bg-black bg-opacity-25 fixed inset-0"
            className="absolute rounded-lg bg-white p-5"
          >
            <button onClick={closeModal}>close</button>
            <h2>Allowance Settings</h2>
            <div>Settings</div>
          </Modal>
        </div>

        <div>
          <TransactionsTable
            transactions={allowance.payments.map((payment) => ({
              ...payment,
              type: "sent",
              date: dayjs(payment.createdAt).fromNow(),
              // date: dayjs.unix(payment.createdAt),
              title: payment.description,
              subTitle: (
                <p className="truncate">
                  {payment.name} @{" "}
                  <a target="_blank" href={payment.location}>
                    {payment.location}
                  </a>
                </p>
              ),
              currency: "€",
              value: 9.99,
            }))}
          />
        </div>
      </Container>
    </div>
  );
}

export default Publisher;
