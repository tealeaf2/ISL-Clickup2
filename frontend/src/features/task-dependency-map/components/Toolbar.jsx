import { Search, Bell, Users } from "lucide-react"

export function Toolbar() {
  return (
    <div className="flex items-center gap-4">
      <Search className="h-5 w-5 text-gray-500" />
      <Bell className="h-5 w-5 text-blue-500" />
      <User className="h-5 w-5 text-green-500" />
    </div>
  )
}
