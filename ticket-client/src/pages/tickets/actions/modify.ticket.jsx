import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import axios from "../../../configs/api";

export default function ModifyTicket({ ticket }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: ticket?.status || "open",
    priority: ticket?.priority || "medium",
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.patch(`/tickets/${ticket.id}`, updatedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(`Ticket #${ticket.id} updated successfully`);
      setIsOpen(false);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to update ticket. Please try again.";
      toast.error(message);
    },
  });

  const handleOpen = () => {
    setFormData({
      status: ticket?.status || "open",
      priority: ticket?.priority || "medium",
    });
    setIsOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <>
      <div className="relative group/tooltip inline-block">
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Edit ticket"
          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs whitespace-nowrap z-30">
          Edit ticket
        </span>
      </div>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <DialogTitle className="text-base font-semibold text-black">
                    Modify Ticket
                  </DialogTitle>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">#{ticket?.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-black rounded-md transition-colors cursor-pointer"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Title
                  </p>
                  <p className="mt-1 text-sm font-medium text-black line-clamp-2">
                    {ticket?.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label
                      htmlFor={`edit-priority-${ticket?.id}`}
                      className="block text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      Priority
                    </label>
                    <select
                      id={`edit-priority-${ticket?.id}`}
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
                      htmlFor={`edit-status-${ticket?.id}`}
                      className="block text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      Status
                    </label>
                    <select
                      id={`edit-status-${ticket?.id}`}
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
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-black border border-gray-200 rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#75ba75] hover:bg-[#66a866] disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
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
