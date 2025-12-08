import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./ui/input-otp";
import { toast } from "sonner@2.0.3";
import { Mail, CheckCircle } from "lucide-react";

interface LoginPageProps {
  onLogin: (userType: 'student' | 'council' | 'teacher', userId: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [schoolId, setSchoolId] = useState("");
  const [userType, setUserType] = useState<'student' | 'council' | 'teacher'>('student');
  const [isTeacher, setIsTeacher] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'email' | 'code'>('email');
  const [sentCode, setSentCode] = useState<string>("");
  const [enteredCode, setEnteredCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  // 이메일 형식에 따라 사용자 타입 자동 결정
  useEffect(() => {
    if (schoolId.endsWith('@sdh.hs.kr')) {
      if (!schoolId.startsWith('sdh')) {
        // 선생님 계정
        setIsTeacher(true);
        setUserType('teacher');
      } else {
        // 학생/학생회
        setIsTeacher(false);
        if (userType === 'teacher') setUserType('student');
      }
    } else {
      setIsTeacher(false);
    }
  }, [schoolId]);
  

  // 인증번호 생성 (6자리 숫자)
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 인증번호 발송 처리
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId.trim()) {
      toast.error("학교 계정을 입력해주세요.");
      return;
    }

    // 학교 계정 형식 검증 (@sdh.hs.kr로 끝나야 함)
    if (!schoolId.endsWith('@sdh.hs.kr')) {
      toast.error("올바른 학교 계정 형식이 아닙니다. (@sdh.hs.kr로 끝나야 합니다)");
      return;
    }

    // 선생님 계정은 sdh로 시작하면 안됨
    if (isTeacher && schoolId.startsWith('sdh')) {
      toast.error("선생님 계정은 sdh로 시작할 수 없습니다.");
      return;
    }

    // 학생/학생회 계정은 sdh로 시작해야 함
    if (!isTeacher && !schoolId.startsWith('sdh')) {
      toast.error("학생 계정은 sdh로 시작해야 합니다.");
      return;
    }

    // Mock: 실제로는 백엔드에서 이메일 발송
    const code = generateVerificationCode();
    setSentCode(code);
    setIsCodeSent(true);
    setVerificationStep('code');
    
    // 개발용: 콘솔에 인증번호 표시
    console.log(`인증번호가 ${schoolId}로 발송되었습니다: ${code}`);
    toast.success(`인증번호가 ${schoolId}로 발송되었습니다.`);
  };

  // 인증번호 확인 및 로그인
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (enteredCode.length !== 6) {
      toast.error("6자리 인증번호를 입력해주세요.");
      return;
    }

    // Mock: 실제로는 백엔드에서 검증
    if (enteredCode === sentCode) {
      toast.success("인증 성공! 로그인합니다.");
      onLogin(userType, schoolId);
    } else {
      toast.error("인증번호가 일치하지 않습니다.");
      setEnteredCode("");
    }
  };

  // 이메일 재입력
  const handleChangeEmail = () => {
    setVerificationStep('email');
    setIsCodeSent(false);
    setEnteredCode("");
    setSentCode("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>학생 민원 관리 시스템</CardTitle>
          <CardDescription>
            {verificationStep === 'email' 
              ? '학교 계정으로 인증받기' 
              : '인증번호를 입력해주세요'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationStep === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolId">학교 계정</Label>
                <Input
                  id="schoolId"
                  type="email"
                  placeholder="sdh123@sdh.hs.kr"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {!isTeacher && (
                <div className="space-y-2">
                  <Label htmlFor="userType">직위 선택</Label>
                  <Select value={userType} onValueChange={(value: 'student' | 'council' | 'teacher') => setUserType(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="직위를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">학생</SelectItem>
                      <SelectItem value="council">학생회</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isTeacher && (
                <div className="space-y-2">
                  <Label>직위</Label>
                  <div className="w-full px-3 py-2 bg-gray-100 rounded-md border border-gray-200">
                    선생님
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full flex items-center justify-center space-x-2">
                <Mail size={18} />
                <span>인증번호 받기</span>
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <Mail className="text-blue-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900">
                      <span className="block mb-1">{schoolId}</span>
                      인증번호가 발송되었습니다.
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      개발 모드: 콘솔에서 인증번호를 확인하세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">인증번호 (6자리)</Label>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={enteredCode}
                    onChange={(value) => setEnteredCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  className="flex-1 flex items-center justify-center space-x-2"
                  disabled={enteredCode.length !== 6}
                >
                  <CheckCircle size={18} />
                  <span>인증하기</span>
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleChangeEmail}
                  className="flex-shrink-0"
                >
                  이메일 변경
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={handleSendCode}
              >
                인증번호 재발송
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}