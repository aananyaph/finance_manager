import Sidebar from "./Sidebar";

type LayoutProps = {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
};

function Layout({
  children,
  activePage,
  setActivePage,
}: LayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main
        style={{
          marginLeft:
            window.innerWidth > 1100
              ? "250px"
              : "78px",

          width:
            window.innerWidth > 1100
              ? "calc(100% - 250px)"
              : "calc(100% - 78px)",

          padding: "32px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;