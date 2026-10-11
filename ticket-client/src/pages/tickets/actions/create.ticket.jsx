import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import axios from "../../../configs/api";

export default function CreateTicket({
  buttonLabel = "Create Ticket",
  isPrimary = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "open",
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (newTicket) => {
      const response = await axios.post("/tickets", newTicket);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(`Ticket #${data.id} created successfully`);
      handleClose();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        "Failed to create ticket. Please try again.";
      toast.error(message);
    },
  });

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "open",
    });
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Ticket title is required");
      return;
    }

    mutate({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      status: formData.status,
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
          isPrimary
            ? "bg-[#75ba75] hover:bg-[#66a866] text-white shadow-xs"
            : "border border-black hover:bg-black hover:text-white text-black"
        }`}
      >
        <PlusIcon className="w-4 h-4" />
        <span>{buttonLabel}</span>
      </button>

      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <DialogTitle className="text-base font-semibold text-black">
                  Create New Ticket
                </DialogTitle>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1 text-gray-400 hover:text-black rounded-md transition-colors cursor-pointer"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="ticket-title"
                    className="block text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ticket-title"
                    name="title"
                    type="text"
                    required
                    placeholder="e.g. Bug with payment checkout"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#75ba75] focus:ring-1 focus:ring-[#75ba75] text-black bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ticket-desc"
                    className="block text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Description{" "}
                    <span className="text-gray-400 font-normal lowercase">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="ticket-desc"
                    name="description"
                    rows={4}
                    placeholder="Provide details or steps to reproduce..."
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#75ba75] focus:ring-1 focus:ring-[#75ba75] text-black bg-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="ticket-priority"
                      className="block text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      Priority
                    </label>
                    <select
                      id="ticket-priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#75ba75] focus:ring-1 focus:ring-[#75ba75] text-black bg-white cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-status"
                      className="block text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      Status
                    </label>
                    <select
                      id="ticket-status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#75ba75] focus:ring-1 focus:ring-[#75ba75] text-black bg-white cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-black border border-gray-200 rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#75ba75] hover:bg-[#66a866] disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                  >
                    {isPending ? "Creating..." : "Create Ticket"}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
