'use client';

export default function LogoutButton()
{
  const handleLogout = async () =>
  {
    try
    {
      try
      {
        console.log("logging out...");
        const response = await fetch("/api/logout",
        {
          method: 'POST',
          credentials: 'include'  // Ensures cookies are sent with the request
        });

        if (!response.ok)
        {
          throw new Error("Failed to log out");
        }
      } catch (error)
      {
        console.error("Error logging out:", error);
        throw error; // Ensure the error is handled by the caller
      }
      window.location.href = "/login"; // Redirect after logout
    } catch (error)
    {
      console.error('Error logging out:', error);
      alert('Error logging out');
    }
  };

  return <button onClick={handleLogout} className="px-4 py-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2 mt-2">Log out</button>;
}