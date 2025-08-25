export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="from-background via-background to-muted/10 min-h-screen w-full bg-gradient-to-br">
      {children}
    </div>
  );
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="from-primary/8 via-primary/4 border-border/30 flex w-full items-center justify-between border-b bg-gradient-to-r to-transparent p-6 backdrop-blur-sm">
      {children}
    </div>
  );
};

export const PageHeaderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="w-full space-y-1">{children}</div>;
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-foreground flex items-center gap-2 text-3xl font-bold">
      {children}
    </h1>
  );
};

export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <p className="text-muted-foreground text-base font-medium">{children}</p>
  );
};

export const PageActions = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-2">{children}</div>;
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-6 p-6">{children}</div>;
};
