package uk.ac.bristol.cs.application.controller;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import uk.ac.bristol.cs.application.model.Statistic;

@RestController
public class StatisticsController {
    @Autowired
    private DataSource dataSource;
    
    private List<Statistic> stats(String query, String code) throws SQLException {
        Connection c = dataSource.getConnection();
        PreparedStatement p = c.prepareStatement(query);
        p.setString(1, code);
        ResultSet r = p.executeQuery();
        List<Statistic> stats = new ArrayList<>();
        while (r.next()) {
            Statistic s = new Statistic();
            s.setCode(code);
            s.setWomen(r.getInt("women"));
            s.setMen(r.getInt("men"));
            s.setOccId(r.getInt("occId"));
            s.setOccName(r.getString("occName"));
            stats.add(s);
        }
        Statistic total = new Statistic();
        total.setCode(code);
        total.setOccName("TOTAL");
        total.setOccId(0);
        int women = 0, men = 0;
        for (Statistic s : stats) {
            women += s.getWomen();
            men += s.getMen();
        }
        total.setWomen(women);
        total.setMen(men);
        stats.add(total);
        return stats;
    }
    
    @GetMapping(path = "/api/details/ward/{code}")
    List<Statistic> getWardStatistics(@PathVariable String code) throws SQLException {
        return stats(
            "SELECT occId, Occupation.name AS occName, " +
            "SUM(gender * data) AS women, SUM((1 - gender) * data) AS men " +
            "FROM Statistic " +
            "INNER JOIN Occupation ON Occupation.id = occId " +
            "WHERE wardId = ? GROUP BY occId ORDER BY occId",
            code
        );
    }
    
    @GetMapping(path = "/api/details/county/{code}")
    List<Statistic> getCountyStatistics(@PathVariable String code) throws SQLException {
        return stats(
            "SELECT occId, Occupation.name AS occName, " +
            "SUM(gender * data) AS women, SUM((1 - gender) * data) AS men " +
            "FROM Statistic " +
            "INNER JOIN Occupation ON Occupation.id = occId " +
            "INNER JOIN Ward ON Ward.code = Statistic.wardId " +
            "WHERE Ward.parent = ? GROUP BY occId ORDER BY occId",
            code
        );
    }
    
    @GetMapping(path = "/api/details/region/{code}")
    List<Statistic> getRegionStatistics(@PathVariable String code) throws SQLException {
        return stats(
            "SELECT occId, Occupation.name AS occName, " +
            "SUM(gender * data) AS women, SUM((1 - gender) * data) AS men " +
            "FROM Statistic " +
            "INNER JOIN Occupation ON Occupation.id = occId " +
            "INNER JOIN Ward ON Ward.code = Statistic.wardId " +
            "INNER JOIN County ON County.code = Ward.parent " +                    
            "WHERE County.parent = ? GROUP BY occId ORDER BY occId",
            code
        );
    }
    
    @GetMapping(path = "/api/details/country/{code}")
    List<Statistic> getCountryStatistics(@PathVariable String code) throws SQLException {
        return stats(
            "SELECT occId, Occupation.name AS occName, " +
            "SUM(gender * data) AS women, SUM((1 - gender) * data) AS men " +
            "FROM Statistic " +
            "INNER JOIN Occupation ON Occupation.id = occId " +
            "INNER JOIN Ward ON Ward.code = Statistic.wardId " +
            "INNER JOIN County ON County.code = Ward.parent " +
            "INNER JOIN Region ON Region.code = County.parent " +
            "WHERE Region.parent = ? GROUP BY occId ORDER BY occId",
            code
        );
    }
}
