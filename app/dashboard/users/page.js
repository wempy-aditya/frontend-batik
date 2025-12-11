"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";

export default function UserManagementPage() {
  const { getUserInfo, handleUnauthorized } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [filterRole, setFilterRole] = useState("all"); // all, admin, registered, premium
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "registered",
    is_active: true,
    is_superuser: false,
    tier_id: null,
    profile_image_url: "",
  });

  const roleColors = {
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    registered: "bg-blue-100 text-blue-800 border-blue-200",
    premium: "bg-amber-100 text-amber-800 border-amber-200",
  };

  const roleIcons = {
    admin: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    registered: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    premium: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus, currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("No authentication token available");
      }

      let url = "/api/users";

      // Apply filters
      if (filterRole !== "all") {
        url = `/api/users/role/${filterRole}`;
      } else if (filterStatus !== "all") {
        url = `/api/users/status/${filterStatus}`;
      }

      url += `?page=${currentPage}&items_per_page=${itemsPerPage}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Check for unauthorized
        if (response.status === 401 || response.status === 403) {
          console.error("Unauthorized - token expired");
          handleUnauthorized();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Users response:", data);
      console.log("Users array:", data.data);

      // Log first user to check data structure
      if (data.data && data.data.length > 0) {
        console.log("First user sample:", data.data[0]);
        console.log("First user is_superuser:", data.data[0].is_superuser);
      }

      setUsers(data.data || []);
      setTotalCount(data.total_count || 0);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (user) => {
    setModalMode("view");
    setSelectedUser(user);
    console.log("User data in handleView:", user);
    setFormData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      role: user.role || "registered",
      is_active: user.is_active !== undefined ? user.is_active : true,
      is_superuser: user.is_superuser !== undefined ? user.is_superuser : false,
      tier_id: user.tier_id || null,
      profile_image_url: user.profile_image_url || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    console.log("User data in handleEdit:", user);
    setFormData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      role: user.role || "registered",
      is_active: user.is_active !== undefined ? user.is_active : true,
      is_superuser: user.is_superuser !== undefined ? user.is_superuser : false,
      tier_id: user.tier_id || null,
      profile_image_url: user.profile_image_url || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === "view") return;

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("No authentication token available");
      }

      const submitData = {
        role: formData.role,
        is_active: formData.is_active,
        is_superuser: formData.is_superuser,
      };

      // Only include tier_id if it's a valid number
      if (formData.tier_id && !isNaN(formData.tier_id)) {
        submitData.tier_id = parseInt(formData.tier_id);
      }

      const response = await fetch(`/api/user/${selectedUser.username}/admin`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        // Check for unauthorized
        if (response.status === 401 || response.status === 403) {
          console.error("Unauthorized - token expired");
          handleUnauthorized();
          return;
        }

        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Update result:", result);

      setSuccessMessage(result.message || "User updated successfully");
      setIsModalOpen(false);
      await fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-xl"></div>
            <svg
              className="absolute inset-0 w-full h-full p-5 text-amber-600 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <p className="text-slate-700 font-medium text-lg">Loading Users...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Page Header */}
        <div className="space-y-6 w-full">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 text-white shadow-sm">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              User Management
            </h2>
            <p className="text-amber-100 text-sm sm:text-base lg:text-lg">
              Manage user roles, status, and permissions
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setFilterStatus("all");
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="registered">Registered</option>
              <option value="premium">Premium</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setFilterRole("all");
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {totalCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Admins</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {roleIcons.admin}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Premium</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-900 mt-1">
                    {users.filter((u) => u.role === "premium").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {roleIcons.premium}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Active Users
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">
                    {users.filter((u) => u.is_active).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Users List - Mobile First */}
          <div className="w-full">
            {filteredUsers.length > 0 ? (
              <>
                {/* Mobile Card View - Priority #1 */}
                <div className="md:hidden space-y-3">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-base truncate">
                            {user.name}
                          </h3>
                          <p className="text-sm text-slate-600 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-slate-500 font-mono mt-1">
                            @{user.username || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            roleColors[user.role] || roleColors.registered
                          }`}
                        >
                          {roleIcons[user.role] || roleIcons.registered}
                          {user.role}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.is_active
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              user.is_active ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "-"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet & Desktop Table View - Priority #2 & #3 */}
                <div className="hidden md:block bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 lg:px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-sm font-bold">
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-sm text-slate-600 truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <span className="text-slate-900 font-mono text-sm">
                                {user.username || "-"}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                  roleColors[user.role] || roleColors.registered
                                }`}
                              >
                                {roleIcons[user.role] || roleIcons.registered}
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                  user.is_active
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    user.is_active
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                                {user.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <span className="text-sm text-slate-600 whitespace-nowrap">
                                {user.created_at
                                  ? new Date(
                                      user.created_at
                                    ).toLocaleDateString()
                                  : "-"}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleView(user)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-600 font-medium">No users found</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white md:bg-slate-50 rounded-xl md:rounded-none px-4 sm:px-6 py-4 mt-3 md:mt-0 border md:border-0 md:border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-slate-600">
                  Page {currentPage} of {totalPages} ({totalCount} users)
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
            <div className="max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-amber-50/50 backdrop-blur-xl border-b border-slate-200/60 p-4 sm:p-6 z-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                      {modalMode === "view" ? "User Details" : "Edit User"}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">
                      {modalMode === "view"
                        ? "View user information"
                        : "Update user role and status"}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <form
                onSubmit={handleSubmit}
                className="p-4 sm:p-6 space-y-4 sm:space-y-6"
              >
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                {/* User Info (Read-only) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    User Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Name
                      </label>
                      <p className="p-3 bg-white rounded-xl text-slate-900 shadow-sm">
                        {formData.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Username
                      </label>
                      <p className="p-3 bg-white rounded-xl text-slate-900 font-mono shadow-sm">
                        {formData.username || "-"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email
                      </label>
                      <p className="p-3 bg-white rounded-xl text-slate-900 shadow-sm">
                        {formData.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role & Status Management */}
                {modalMode === "edit" && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      Role & Status Management
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        >
                          <option value="registered">Registered</option>
                          <option value="premium">Premium</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Tier ID
                        </label>
                        <input
                          type="number"
                          name="tier_id"
                          value={formData.tier_id || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          placeholder="Optional"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-500 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900">
                              Active Status
                            </span>
                            <p className="text-xs text-slate-600">
                              User can login and access the system
                            </p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-500 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            name="is_superuser"
                            checked={formData.is_superuser}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900">
                              Superuser Privileges
                            </span>
                            <p className="text-xs text-slate-600">
                              Grant full administrative access
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Mode Display */}
                {modalMode === "view" && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      Permissions & Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Role
                        </label>
                        <span
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border ${
                            roleColors[formData.role] || roleColors.registered
                          }`}
                        >
                          {roleIcons[formData.role] || roleIcons.registered}
                          {formData.role}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Status
                        </label>
                        <span
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold ${
                            formData.is_active
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              formData.is_active ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                          {formData.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Superuser
                        </label>
                        <span
                          className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold ${
                            formData.is_superuser
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {formData.is_superuser ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Tier ID
                        </label>
                        <p className="p-3 bg-white rounded-xl text-slate-900 shadow-sm">
                          {formData.tier_id || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {selectedUser && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      Metadata
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          User ID
                        </label>
                        <p className="font-mono text-slate-900 break-all">
                          {selectedUser.id}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Created At
                        </label>
                        <p className="text-slate-900">
                          {selectedUser.created_at
                            ? new Date(selectedUser.created_at).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Updated At
                        </label>
                        <p className="text-slate-900">
                          {selectedUser.updated_at
                            ? new Date(selectedUser.updated_at).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Deleted
                        </label>
                        <p className="text-slate-900">
                          {selectedUser.is_deleted ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {modalMode === "edit" ? (
                    <>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-50"
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 bg-slate-100 text-slate-700 px-6 py-3.5 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setModalMode("edit")}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300"
                    >
                      Edit User
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
