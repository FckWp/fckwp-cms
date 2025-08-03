import { useEffect } from "react";
import { useLocation } from "wouter";
//@ts-ignore
import pb from "@/lib/pb";

interface ProtectedAdminProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

const ProtectedAdminRoute = ({ component: Component, ...rest }: ProtectedAdminProps) => {
  const [_, setLocation] = useLocation();
  const isLoggedIn = pb.authStore.isValid;
  const adminModel = pb.authStore.model;

  useEffect(() => {
    const hasAccess =
      isLoggedIn &&
      adminModel?.collectionName === "_superusers";

    if (!hasAccess) {
      setLocation("/admin/login");
    }
  }, [isLoggedIn, adminModel, setLocation]);

  if (!isLoggedIn || adminModel?.collectionName !== "_superusers") {
    return null;
  }

  return <Component {...rest} />;
};

export default ProtectedAdminRoute;
