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

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
	return (
		<Card className="h-100 border-0 shadow-sm rounded-4">
			<div className="bg-light py-5 text-center position-relative">
				<Badge bg="info" className="position-absolute top-0 start-0 m-3 text-uppercase">{course.category}</Badge>
				<PlayCircle size={48} className="text-primary opacity-25" />
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
