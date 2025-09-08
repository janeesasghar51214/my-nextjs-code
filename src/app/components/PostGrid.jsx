"use client";

export default function PostGrid({ posts, onPostClick }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.map((post, index) => (
        <div
          key={post._id || index} // ✅ unique key fix
          className="relative group cursor-pointer"
          onClick={() => onPostClick(post)}
        >
          <img
            src={post.image_url}
            alt="Post"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <p className="text-white text-sm">
              ❤️ {post.likes_count || 0} 💬 {post.comments_count || 0}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
