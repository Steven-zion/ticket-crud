import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from "@headlessui/react";
import {
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import axios from "../../../configs/api";

export default function DeleteTicket({ ticket }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`/tickets/${ticket.id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(`Ticket #${ticket.id} deleted successfully`);
      setIsOpen(false);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        "Failed to delete ticket. Please try again.";
      toast.error(message);
    },
  });

  return (
    <>
      <div className="relative group/tooltip inline-block">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Delete ticket"
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs whitespace-nowrap z-30">
          Delete ticket
        </span>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-full border border-red-100 flex-shrink-0">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold text-black">
                    Delete
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Are you sure you want to permanently delete ticket{" "}
                    <span className="font-mono font-semibold text-black">
                      #{ticket?.id}
                    </span>
                    ? This action is irreversible.
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-5 border-t border-gray-100 mt-5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-black border border-gray-200 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => mutate()}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  {isPending ? "Deleting..." : "Delete Ticket"}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
