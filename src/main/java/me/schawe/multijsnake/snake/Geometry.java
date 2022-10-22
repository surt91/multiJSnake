package me.schawe.multijsnake.snake;

public class Geometry {
    public static double angle(Coordinate subject, Move direction, Coordinate object) {
        double dx = object.getX() - subject.getX();
        double dy = object.getY() - subject.getY();

        // apply coordinate rotation, such that the snake always looks to the right
        // from the point of view of the atan
        // also note that our coordinate system grows down, so up points to lower values of y
        return switch (direction) {
            case right -> -Math.atan2(dy, dx);
            case up -> Math.atan2(-dx, -dy);
            case left -> -Math.atan2(-dy, -dx);
            case down -> Math.atan2(dx, dy);
        };
    }
}
