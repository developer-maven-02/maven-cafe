// "use client";

// export const dynamic = "force-dynamic";

// import { useState } from "react";
// import { ArrowLeft, Star } from "lucide-react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { post } from "@/lib/api";

// export default function ReviewPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const id = searchParams.get("id");
//   const type = searchParams.get("type");

//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");

//   const handleSubmit = async () => {
//     if (!rating) {
//       alert("Please select rating");
//       return;
//     }

//     try {
//       const result = await post("/review", {
//         id,
//         rating,
//         review: comment,
//         type,
//       });

//       if (result.success) {
//         alert("Review submitted");
//         router.back();
//       } else {
//         alert(result.message);
//       }
//     } catch (error) {
//       console.log(error);
//       alert("Something went wrong");
//     }
//   };

//   return (
//     <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">
//       <div className="flex items-center gap-3 p-4 bg-white border-b">
//         <button onClick={() => router.back()}>
//           <ArrowLeft size={20} />
//         </button>

//         <h1 className="font-semibold text-lg text-[#103c7f]">
//           Cafeteria Review
//         </h1>
//       </div>

//       <div className="p-4 space-y-5">
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <p className="text-sm font-medium mb-3">
//             Rate your experience
//           </p>

//           <div className="flex gap-2">
//             {[1, 2, 3, 4, 5].map((star) => (
//               <Star
//                 key={star}
//                 size={28}
//                 onClick={() => setRating(star)}
//                 className={`cursor-pointer ${
//                   rating >= star
//                     ? "text-yellow-400 fill-yellow-400"
//                     : "text-gray-300"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <p className="text-sm font-medium mb-2">
//             Comments
//           </p>

//           <textarea
//             placeholder="Share your feedback..."
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             className="w-full border rounded-lg p-3 text-sm outline-none"
//             rows={4}
//           />
//         </div>

//         <button
//           onClick={handleSubmit}
//           className="w-full bg-[#103c7f] text-white py-3 rounded-xl"
//         >
//           Submit Review
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { post } from "@/lib/api";
import Image from "next/image";

function ReviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const type = searchParams.get("type");

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!rating) {
      alert("Please select rating");
      return;
    }

    try {
      const result = await post("/review", {
        id,
        rating,
        review: comment,
        type,
      });

      if (result.success) {
        alert("Review submitted");
        router.back();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#103c7f]">
            <ArrowLeft size={20} />
          </button>

          <h1 className="font-semibold text-lg text-[#103c7f]">
            Review
          </h1>
        </div>
        <div className="w-20 h-8 relative">
          <Image
            src="/logo.png"
            alt="Maven Cafe Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="p-4 space-y-5">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-medium mb-3 text-[#103c7f]">Rate your experience</p>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={28}
                onClick={() => setRating(star)}
                className={`cursor-pointer ${
                  rating >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 text-[#103c7f]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-medium mb-2 text-[#103c7f]">Comments</p>

          <textarea
            placeholder="Share your feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm outline-none"
            rows={4}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#103c7f] text-white py-3 rounded-xl"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={null}>
      <ReviewInner />
    </Suspense>
  );
}