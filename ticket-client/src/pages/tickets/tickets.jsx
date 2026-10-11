import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TicketIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import axios from "../../configs/api";

import CreateTicket from "./actions/create.ticket";
import ModifyTicket from "./actions/modify.ticket";
import DeleteTicket from "./actions/delete.ticket";

export default function Tickets() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const limit = 11;

  // Fetch tickets with pagination, status filter, priority filter, and search
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["tickets", page, statusFilter, priorityFilter, search],
    queryFn: async () => {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search.trim()) params.search = search.trim();
      const response = await axios.get("/tickets", { params });
      return response.data;
    },
  });

  const tickets = data?.data || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  };

  const hasActiveFilters = Boolean(statusFilter || priorityFilter || search.trim());

  const handleClearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setSearch("");
    setPage(1);
  };

  // Status badge
  const renderStatusBadge = (status) => {
    const labels = {
      open: "Open",
      in_progress: "In Progress",
      closed: "Closed",
    };

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200 text-black bg-white">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === "open"
              ? "bg-[#75ba75]"
              : status === "in_progress"
                ? "bg-black"
                : "bg-gray-400"
          }`}
        />
        {labels[status] || status}
      </span>
    );
  };

  // Priority badge
  const renderPriorityBadge = (priority) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };

    return (
      <span
        className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
          priority === "high"
            ? "text-black font-semibold bg-gray-100"
            : "text-gray-600 bg-gray-50"
        }`}
      >
        {labels[priority] || priority}
      </span>
    );
  };

  // Loader
  if (isPending) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#75ba75] rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-gray-400 font-mono">
            Loading tickets...
          </p>
        </div>
      </div>
    );
  }

  // Error State fallback
  if (isError) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-sm font-semibold text-black">
            Error loading tickets
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {error?.response?.data?.message ||
              error?.message ||
              "Please check server connection."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* state 1: Empty State (when there are no tickets at all or none match filter/search) */}
        {tickets?.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#75ba75] mb-4 sm:mb-5">
              <TicketIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-black">
              No tickets found
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-sm mb-6">
              {hasActiveFilters
                ? "No tickets match your current search or filter criteria."
                : "Your tracker is empty. Create your first support ticket to get started."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3.5 py-2 text-xs font-medium text-gray-600 hover:text-black border border-gray-200 rounded-md transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <CreateTicket buttonLabel="Create First Ticket" />
            </div>
          </div>
        ) : (
          /* state 2: Populated State (tickets?.length > 0) */
          <div className="space-y-5 sm:space-y-6">
            {/* Top Header: Title on left, Create Ticket on right (justify-between) */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-black">
                    Tickets
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-mono font-medium bg-gray-100 text-gray-700 rounded-full">
                    {pagination.total}{" "}
                    {pagination.total === 1 ? "ticket" : "tickets"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  Manage tickets, priorities and workflow statuses.
                </p>
              </div>

              <CreateTicket />
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar (ID or Title) */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by ID or title..."
                  className="w-full text-xs font-medium text-black bg-white border border-gray-200 rounded-md pl-8 pr-8 py-2 placeholder-gray-400 focus:outline-none focus:border-[#75ba75]"
                />
                <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="p-1 text-gray-400 hover:text-black absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                    title="Clear search"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters Group */}
              <div className="flex items-center gap-2.5">
                {/* Priority */}
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={priorityFilter}
                    onChange={(e) => {
                      setPriorityFilter(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Filter tickets by priority"
                    className="w-full sm:w-auto text-xs font-medium text-black bg-white border border-gray-200 rounded-md pl-7 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:border-[#75ba75]"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <FunnelIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Status */}
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Filter tickets by status"
                    className="w-full sm:w-auto text-xs font-medium text-black bg-white border border-gray-200 rounded-md pl-7 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:border-[#75ba75]"
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                  <FunnelIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="p-2 text-xs text-gray-500 hover:text-black border border-gray-200 rounded-md transition-colors cursor-pointer"
                    title="Reset all filters"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Listing table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
              <table className="w-full text-left text-sm border-collapse min-w-[520px] sm:min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                    <th className="py-3 px-3 sm:px-4 w-20 sm:w-24">ID</th>
                    <th className="py-3 px-3 sm:px-4">Title</th>
                    <th className="py-3 px-3 sm:px-4 w-24 sm:w-28">Priority</th>
                    <th className="py-3 px-3 sm:px-4 w-28 sm:w-32">Status</th>
                    <th className="hidden md:table-cell py-3 px-4 w-32">Created</th>
                    <th className="py-3 px-3 sm:px-4 w-20 sm:w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3 px-3 sm:px-4 font-mono text-xs font-semibold text-black">
                        #{ticket.id}
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-medium text-black">
                          {ticket.title}
                        </div>
                        {ticket.description && (
                          <div className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md mt-0.5">
                            {ticket.description}
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 sm:px-4">
                        {renderPriorityBadge(ticket.priority)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 sm:px-4">
                        {renderStatusBadge(ticket.status)}
                      </td>

                      {/* Created - hidden on smaller mobile, visible on md+ */}
                      <td className="hidden md:table-cell py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {moment(ticket.createdAt).fromNow()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <ModifyTicket ticket={ticket} />
                          <DeleteTicket ticket={ticket} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500 font-mono">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="p-1.5 border border-gray-200 rounded-md text-gray-600 hover:text-black hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page >= pagination.totalPages}
                    aria-label="Next page"
                    className="p-1.5 border border-gray-200 rounded-md text-gray-600 hover:text-black hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
