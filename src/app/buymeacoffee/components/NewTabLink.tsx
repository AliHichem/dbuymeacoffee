
interface NewTabLinkProps {
    children: React.ReactNode;
    [x: string]: any;
}

export const NewTabLink = ({ children, ...other }: NewTabLinkProps) => {
  return (
    <a {...other} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

export default NewTabLink;
