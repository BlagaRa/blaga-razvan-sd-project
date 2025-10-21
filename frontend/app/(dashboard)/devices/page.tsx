"use client";

import { useEffect, useState } from "react";
import {
  useDeviceStore,
  DeviceRoom,
  DeviceType,
} from "@/store/deviceStore";
import {
  Lightbulb,
  Shield,
  Wifi,
  Gauge,
  Trash2,
  PlusCircle,
  Home,
  Bed,
  Bath,
  Utensils,
  Power,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function Devices() {
  const { devices, getMyDevices, createDevice, deleteDevice, updateDevice, loading } =
    useDeviceStore();

  const [open, setOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: "",
    maxConsumption: 0,
    room: "LIVINGROOM" as DeviceRoom,
    type: "LIGHT" as DeviceType,
  });

  useEffect(() => {
    getMyDevices();
  }, [getMyDevices]);

  /** === ICON HELPERS === */
  const getRoomIcon = (room: DeviceRoom) => {
    switch (room) {
      case "LIVINGROOM":
        return <Home className="text-amber-500" />;
      case "BEDROOM":
        return <Bed className="text-purple-500" />;
      case "KITCHEN":
        return <Utensils className="text-emerald-500" />;
      case "BATHROOM":
        return <Bath className="text-blue-500" />;
      default:
        return <Home />;
    }
  };

  const getTypeIcon = (type: DeviceType) => {
    switch (type) {
      case "LIGHT":
        return <Lightbulb className="text-yellow-400" />;
      case "SENSOR":
        return <Gauge className="text-indigo-500" />;
      case "NETWORK":
        return <Wifi className="text-cyan-500" />;
      case "SECURITY":
        return <Shield className="text-red-500" />;
      default:
        return <Lightbulb />;
    }
  };

  const getConsumptionColor = (consumption: number) => {
    if (consumption < 50) return "text-green-600";
    if (consumption < 150) return "text-yellow-600";
    return "text-red-600";
  };

  /** === ADD DEVICE === */
  const handleCreate = async () => {
    if (!newDevice.name.trim()) return;
    const ok = await createDevice(newDevice);
    if (ok) {
      setOpen(false);
      setNewDevice({
        name: "",
        maxConsumption: 0,
        room: "LIVINGROOM",
        type: "LIGHT",
      });
    }
  };

  /** === TOGGLE STATUS === */
  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "ONLINE" ? "OFLINE" : "ONLINE";
    await updateDevice(id, { status: newStatus });
  };

  return (
    <div className="p-8 ml-80 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Smart Devices</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-primary text-white hover:opacity-90 cursor-pointer">
              <PlusCircle size={18} />
              Add Device
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add a New Device</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Input
                placeholder="Device name"
                value={newDevice.name}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, name: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Max Consumption (W)"
                value={newDevice.maxConsumption}
                onChange={(e) =>
                  setNewDevice({
                    ...newDevice,
                    maxConsumption: +e.target.value,
                  })
                }
              />

              <Select
                value={newDevice.room}
                onValueChange={(val) =>
                  setNewDevice({ ...newDevice, room: val as DeviceRoom })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIVINGROOM">Living Room 🛋️</SelectItem>
                  <SelectItem value="BEDROOM">Bedroom 🛏️</SelectItem>
                  <SelectItem value="KITCHEN">Kitchen 🍳</SelectItem>
                  <SelectItem value="BATHROOM">Bathroom 🛁</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={newDevice.type}
                onValueChange={(val) =>
                  setNewDevice({ ...newDevice, type: val as DeviceType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIGHT">Light 💡</SelectItem>
                  <SelectItem value="SENSOR">Sensor 📡</SelectItem>
                  <SelectItem value="NETWORK">Network 🌐</SelectItem>
                  <SelectItem value="SECURITY">Security 🔒</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleCreate}
                className="w-full mt-2 bg-primary text-white hover:opacity-90 cursor-pointer"
              >
                Add Device
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Device List */}
      {loading ? (
        <p className="text-gray-500">Loading devices...</p>
      ) : devices.length === 0 ? (
        <p className="text-gray-600">No devices yet. Add one above 👆</p>
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {devices.map((d) => (
            <div
              key={d.id}
              className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 flex flex-row justify-between items-center hover:shadow-lg transition"
            >
              {/* Device Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  {getRoomIcon(d.room)}
                  {getTypeIcon(d.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{d.name}</h4>
                  <p className="text-sm text-gray-500">
                    {d.room} • {d.type}
                  </p>
                  <p
                    className={`text-sm font-medium ${getConsumptionColor(
                      d.maxConsumption
                    )}`}
                  >
                    🔋 {d.maxConsumption}W
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <Power
                    size={18}
                    className={
                      
                      d.status === "ONLINE"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  />
                  <Switch
                    checked={d.status === "ONLINE"}
                    onCheckedChange={() => toggleStatus(d.id, d.status)}
                    className='cursor-pointer'
                  />
                </div>

                <button
                  onClick={() => deleteDevice(d.id)}
                  className="text-red-500 hover:text-red-700 transition cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
