"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toasts";

import { useProfileStore, Profile } from "@/store/profileStore";
import {
  useDeviceStore,
  Device,
  DeviceStatus,
  DeviceRoom,
} from "@/store/deviceStore";
import { useUserStore, AuthUser } from "@/store/userStore";

export default function AdminDashboard() {
  const { getAllProfiles, profiles, updateProfile } = useProfileStore();
  const { getAllDevices, allDevices, updateDeviceByIdAsAdmin, deleteDevice } = useDeviceStore();
  const { auths, getAllAuth, updateAuthById, isAdmin } = useUserStore();

  const [tab, setTab] = useState<"profiles" | "devices" | "users">("profiles");

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  /** ===== Load data ===== */
  useEffect(() => {
    if (isAdmin) {
      getAllProfiles();
      getAllDevices();
      getAllAuth();
    }
  }, [isAdmin, getAllProfiles, getAllDevices, getAllAuth]);

  if (!isAdmin)
    return (
      <div className="ml-80 p-10 text-red-500 font-semibold text-lg">
        🚫 You do not have permission to access this page.
      </div>
    );

  return (
    <div className="p-10 ml-80 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🛠️ Admin Dashboard
      </h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="profiles">Profiles 👤</TabsTrigger>
          <TabsTrigger value="devices">Devices 💡</TabsTrigger>
          <TabsTrigger value="users">Users 👥</TabsTrigger>
        </TabsList>

        {/* ===================== PROFILES ===================== */}
        <TabsContent value="profiles">
          <Card className="mt-6 shadow-md">
            <CardHeader>
              <h2 className="font-semibold text-gray-800 text-lg">All Profiles</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">First Name</th>
                      <th className="px-4 py-2 text-left">Last Name</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="px-4 py-2">{p.id}</td>
                        <td className="px-4 py-2">{p.firstName}</td>
                        <td className="px-4 py-2">{p.lastName}</td>
                        <td className="px-4 py-2 truncate max-w-xs">
                          {p.description}
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProfile(p);
                              setIsProfileDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== DEVICES ===================== */}
        <TabsContent value="devices">
          <Card className="mt-6 shadow-md">
            <CardHeader>
              <h2 className="font-semibold text-gray-800 text-lg">All Devices</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-2">Name</th>
                      <th className="text-left px-4 py-2">Type</th>
                      <th className="text-left px-4 py-2">Room</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Max Consumption</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDevices.map((d) => (
                      <tr key={d.id} className="border-b">
                        <td className="px-4 py-2">{d.name}</td>
                        <td className="px-4 py-2">{d.type}</td>
                        <td className="px-4 py-2">{d.room}</td>
                        <td className="px-4 py-2">
                          <Badge
                            className={
                              d.status === "ONLINE"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {d.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                        {(() => {
                          let colorClass = "bg-gray-100 text-gray-700";
                          if (d.maxConsumption <= 50) colorClass = "bg-green-100 text-green-700";
                          else if (d.maxConsumption <= 150) colorClass = "bg-yellow-100 text-yellow-800";
                          else if (d.maxConsumption <= 300) colorClass = "bg-orange-100 text-orange-700";
                          else colorClass = "bg-red-100 text-red-700";

                          return (
                            <span
                              className={`px-3 py-1 rounded-md font-medium ${colorClass} shadow-sm border border-gray-200`}
                            >
                              ⚡ {d.maxConsumption}W
                            </span>
                          );
                        })()}
                        </td>

                        <td className="px-4 py-2 flex gap-2">
                          <Button
                            className='cursor-pointer'
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDevice(d);
                              setIsDeviceDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            className='cursor-pointer'

                            size="sm"
                            variant="destructive"
                            onClick={() => deleteDevice(d.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== USERS ===================== */}
        <TabsContent value="users">
          <Card className="mt-6 shadow-md">
            <CardHeader>
              <h2 className="font-semibold text-gray-800 text-lg">All Users</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-2">ID</th>
                      <th className="text-left px-4 py-2">Email</th>
                      <th className="text-left px-4 py-2">Username</th>
                      <th className="text-left px-4 py-2">Admin</th>
                      <th className="text-left px-4 py-2">Email Verified</th>
                      <th className="text-left px-4 py-2">Banned</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auths.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="px-4 py-2">{u.id}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.username}</td>
                        <td className="px-4 py-2">
                          <Badge
                            className={
                              u.isAdmin
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {u.isAdmin ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            className={
                              u.isEmailVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {u.isEmailVerified ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            className={
                              u.isBanned
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }
                          >
                            {u.isBanned ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(u);
                              setIsUserDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ====== PROFILE EDIT DIALOG ====== */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile #{selectedProfile?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="First name"
              value={selectedProfile?.firstName ?? ""}
              onChange={(e) =>
                setSelectedProfile({
                  ...selectedProfile!,
                  firstName: e.target.value,
                })
              }
            />
            <Input
              placeholder="Last name"
              value={selectedProfile?.lastName ?? ""}
              onChange={(e) =>
                setSelectedProfile({
                  ...selectedProfile!,
                  lastName: e.target.value,
                })
              }
            />
            <Textarea
              placeholder="Description"
              value={selectedProfile?.description ?? ""}
              onChange={(e) =>
                setSelectedProfile({
                  ...selectedProfile!,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={async () => {
                if (selectedProfile) {
                  await updateProfile(selectedProfile);
                  setIsProfileDialogOpen(false);
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ====== DEVICE EDIT DIALOG ====== */}
      <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Device: {selectedDevice?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Device name"
              value={selectedDevice?.name ?? ""}
              onChange={(e) =>
                setSelectedDevice({ ...selectedDevice!, name: e.target.value })
              }
            />
            <Select
              value={selectedDevice?.status ?? "ONLINE"}
              onValueChange={(v) =>
                setSelectedDevice({ ...selectedDevice!, status: v as DeviceStatus })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONLINE">ONLINE</SelectItem>
                <SelectItem value="OFLINE">OFLINE</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedDevice?.room ?? "LIVINGROOM"}
              onValueChange={(v) =>
                setSelectedDevice({ ...selectedDevice!, room: v as DeviceRoom })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIVINGROOM">Living Room</SelectItem>
                <SelectItem value="BEDROOM">Bedroom</SelectItem>
                <SelectItem value="BATHROOM">Bathroom</SelectItem>
                <SelectItem value="KITCHEN">Kitchen</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Max consumption (W)"
              type="number"
              value={selectedDevice?.maxConsumption ?? ""}
              onChange={(e) =>
                setSelectedDevice({
                  ...selectedDevice!,
                  maxConsumption: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={async () => {
                if (selectedDevice) {
                  await updateDeviceByIdAsAdmin(selectedDevice.id, selectedDevice);
                  setIsDeviceDialogOpen(false);
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ====== USER EDIT DIALOG ====== */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Email"
              value={selectedUser?.email ?? ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser!, email: e.target.value })
              }
            />
            <Input
              placeholder="Username"
              value={selectedUser?.username ?? ""}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser!, username: e.target.value })
              }
            />
            <Select
              value={selectedUser?.isAdmin ? "ADMIN" : "USER"}
              onValueChange={(v) =>
                setSelectedUser({
                  ...selectedUser!,
                  isAdmin: v === "ADMIN",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedUser?.isBanned ? "YES" : "NO"}
              onValueChange={(v) =>
                setSelectedUser({ ...selectedUser!, isBanned: v === "YES" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Banned?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO">Not Banned</SelectItem>
                <SelectItem value="YES">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={async () => {
                if (selectedUser) {
                  await updateAuthById(selectedUser.id, selectedUser);
                  setIsUserDialogOpen(false);
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
