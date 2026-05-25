import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { PlayCircle, Star, Users } from "lucide-react";

interface Course {
	id: number;
	title: string;
	instructor: string;
	category: string;
	rating: number;
	students: number;
	price: string;
}

const categoryColor = (cat: string): string => {
	const map: Record<string, string> = {
		react: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
		mongodb: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
		fullstack: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
		javascript: "linear-gradient(135deg,#fef9c3,#fef08a)",
		node: "linear-gradient(135deg,#dcfce7,#86efac)",
		css: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
	};
	return map[cat.toLowerCase().replace(/\s+/g, "")] ?? "linear-gradient(135deg,#f1f5f9,#e2e8f0)";
};

const categoryIconColor = (cat: string): string => {
	const map: Record<string, string> = {
		react: "#3b82f6",
		mongodb: "#16a34a",
		fullstack: "#7c3aed",
		javascript: "#ca8a04",
		node: "#15803d",
		css: "#db2777",
	};
	return map[cat.toLowerCase().replace(/\s+/g, "")] ?? "#64748b";
};

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
	const category = course.category ?? "General";

	return (
		<Card className="h-100 border-0 shadow-sm rounded-4">
			<div
				className="d-flex align-items-center justify-content-center position-relative overflow-hidden"
				style={{ height: 160, background: categoryColor(category) }}
			>
				<Badge
					bg="white"
					text="dark"
					className="position-absolute top-0 start-0 m-3 text-uppercase"
					style={{ color: categoryIconColor(category), fontWeight: 600, letterSpacing: "0.03em" }}
				>
					{category}
				</Badge>
				<PlayCircle size={48} style={{ color: categoryIconColor(category), opacity: 0.7 }} />
			</div>
			<Card.Body>
				<div className="d-flex align-items-center mb-3">
					<Star className="text-warning" size={16} />
					<span className="ms-2 fw-semibold">{course.rating}</span>
					<span className="ms-2 text-muted">({course.students} alumnos)</span>
				</div>
				<Card.Title className="h5 fw-bold">{course.title}</Card.Title>
				<Card.Text className="text-muted small mb-4 d-flex align-items-center gap-2"><Users size={14} /> Prof. {course.instructor}</Card.Text>
				<div className="d-flex justify-content-between align-items-center pt-3 border-top">
					<span className="h5 mb-0">{course.price}</span>
					<Button size="sm" variant="primary" className="rounded-pill px-4">Detalles</Button>
				</div>
			</Card.Body>
		</Card>
	);
};

export default CourseCard;
