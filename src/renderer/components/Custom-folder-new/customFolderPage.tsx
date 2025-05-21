interface CustomFolderProps {
  menuId: string;
}

export const CustomFolderPage = ({ menuId }: CustomFolderProps) => {
  return (
    <div className="custom-folder-page">
      <h1>Custom Folder Page</h1>
        <p>Menu ID: {menuId}</p>
        {/* Add your custom folder content here */}
      <p>This is the custom folder page.</p>
    </div>
  );
};
