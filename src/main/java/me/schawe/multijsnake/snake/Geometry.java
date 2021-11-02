package me.schawe.multijsnake.snake;

public class Geometry {
    public static double angle(Coordinate subject, Move direction, Coordinate object) {
        double rad;
        double dx = object.getX() - subject.getX();
        double dy = object.getY() - subject.getY();

        // apply coordinate rotation, such that the snake always looks to the right
        // from the point of view of the atan
        // also note that our coordinate system grows down, so up points to lower values of y
        switch (direction) {
            case right:
                rad = -Math.atan2(dy, dx);
                break;
            case up:
                rad = Math.atan2(-dx, -dy);
                break;
            case left:
                rad = -Math.atan2(-dy, -dx);
                break;
            case down:
                rad = Math.atan2(dx, dy);
                break;
            default:
                throw new RuntimeException("unreachable!");
        }

        return rad;
    }
}
