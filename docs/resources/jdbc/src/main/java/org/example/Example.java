package org.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class Example {

    public static String CS = "jdbc:mariadb://localhost:3306/elections?user=vagrant&localSocket=/var/run/mysqld/mysqld.sock";

    private void readData(Connection c) {
        String SQL = "SELECT id, name FROM Party";
        try (PreparedStatement s = c.prepareStatement(SQL)) {
            ResultSet r = s.executeQuery();
            while (r.next()) {
                int id = r.getInt("id");
                String name = r.getString("name");
                System.out.println("Party #" + id + " is: " + name);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) {
        Example example = new Example();
        try (Connection c = DriverManager.getConnection(CS)) {
            example.readData(c);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}