import { useState, useRef } from "react";
import { SendIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";

import utils from "../../../../common/lib/utils";

const initialFormData = Object.freeze({
	password: "",
});

export default function ConnectLnTerminal() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState(initialFormData);
	const [loading, setLoading] = useState(false);

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setFormData({
			...formData,
			[event.target.name]: event.target.value.trim(),
		});
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		const { password } = formData;
		const account = {
			name: "LN Terminal",
			config: {
				password,
				server: "mailbox.terminal.lightning.today:443",
			},
			connector: "lnterminalconnect",
		};

		try {
			const validation = await utils.call("validateAccount", account);
			if (validation.valid) {
				const addResult = await utils.call("addAccount", account);
				if (addResult.accountId) {
					await utils.call("selectAccount", {
						id: addResult.accountId,
					});
					navigate("/test-connection");
				}
			} else {
				alert(`
					Connection failed. Are your credentials correct? \n\n(${validation.error})`);
			}
		} catch (e) {
			console.error(e);
			let message = "Connection failed. Are your credentials correct?";
			if (e instanceof Error) {
				message += `\n\n${e.message}`;
			}
			alert(message);
		}
		setLoading(false);
	}

	return (
		<div className="relative mt-24 lg:flex space-x-8">
			<div className="lg:w-1/2">
				<h1 className="text-3xl font-bold">Connect to your Lightning Terminal</h1>
				<p className="text-gray-500 mt-6">

				</p>
				<form onSubmit={handleSubmit}>
					<div className="w-4/5">
						<div className="mt-6">
							<label className="block font-medium text-gray-700">Password</label>
							<div className="mt-1">
								<Input
									name="password"
									placeholder="Your pairing phrase"
									onChange={handleChange}
									required
								/>
							</div>
						</div>
					</div>
					<div className="mt-8 flex space-x-4">
						<Button
							label="Back"
							onClick={(e) => {
								e.preventDefault();
								navigate(-1);
								return false;
							}}
						/>
						<Button
							type="submit"
							label="Continue"
							primary
							loading={loading}
							disabled={formData.password === ""}
						/>
					</div>
				</form>
			</div>
			<div className="mt-16 lg:mt-0 lg:w-1/2">
				<div className="lg:flex h-full justify-center items-center">
					<img
						src="assets/icons/satsymbol.svg"
						alt="sat"
						className="max-w-xs"
					/>
				</div>
			</div>
		</div>
	);
}
