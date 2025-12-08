import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { LogOut, User } from "lucide-react";

interface NavbarProps {
  userType: 'student' | 'council' | 'teacher';
  userId: string;
  onLogout: () => void;
}

export default function Navbar({ userType, userId, onLogout }: NavbarProps) {
  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return '학생';
      case 'council': return '학생회';
      case 'teacher': return '선생님';
      default: return '';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'council': return 'bg-green-100 text-green-800';
      case 'teacher': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl">학생 민원 관리 시스템</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User size={16} />
            <span className="text-sm">{userId}</span>
            <Badge className={getBadgeColor(userType)}>
              {getUserTypeLabel(userType)}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center space-x-1"
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}