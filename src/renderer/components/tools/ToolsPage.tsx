interface ToolsPageProps {
  menuId: string;
}

export const ToolsPage = ({ menuId }: ToolsPageProps) => {
  return (
    <div className="tools-page">
      <h1>Tools Page</h1>
      <p>This is the tools page.</p>
      <p>Menu ID: {menuId}</p>
    </div>
  );
};
